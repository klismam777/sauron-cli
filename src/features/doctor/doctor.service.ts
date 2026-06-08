import fs from 'fs-extra';
import path from 'path';
import { getManifest, generateHash } from '../../core/manifest.service.js';
import { RegistryService } from '../../core/registry/registry.service.js';
import { AdapterRegistry } from '../../core/adapters/index.js';

export interface DoctorIssue {
  severity: 'error' | 'warning';
  message: string;
  file?: string;
  fix?: string;
}

export interface DoctorReport {
  success: boolean;
  issues: DoctorIssue[];
}

export class DoctorService {
  private registryService = new RegistryService();

  public async execute(cwd: string): Promise<DoctorReport> {
    const issues: DoctorIssue[] = [];

    // 1. Inspeciona se o projeto está cadastrado no Global Registry central
    const workspaces = await this.registryService.listWorkspaces();
    const normalizedCwd = path.resolve(cwd).replace(/\\/g, '/');
    const registered = workspaces.find(
      (w) => path.resolve(w.rootPath).replace(/\\/g, '/') === normalizedCwd
    );

    if (!registered) {
      issues.push({
        severity: 'warning',
        message: 'Este projeto não está cadastrado no registro central do Sauron na máquina.',
        fix: 'Execute "sauron init" para registrar o projeto globalmente.',
      });
    }

    // 2. Valida a integridade do manifesto local (.sauron/.manifest.json)
    const manifest = await getManifest(cwd);
    if (!manifest) {
      issues.push({
        severity: 'error',
        message: 'Manifesto do Sauron (.sauron/.manifest.json) não foi encontrado.',
        fix: 'Execute "sauron init -y" para reinjetar a estrutura de manifesto.',
      });
    } else {
      // Compara hashes dos arquivos sob gerência do manifesto
      for (const [relPath, expectedHash] of Object.entries(manifest.files)) {
        const fullPath = path.join(cwd, relPath);
        if (!(await fs.pathExists(fullPath))) {
          issues.push({
            severity: 'error',
            message: `Arquivo gerenciado pelo manifesto está ausente: ${relPath}`,
            file: relPath,
            fix: 'Execute "sauron init" para restaurar os arquivos originais.',
          });
          continue;
        }

        const fileContent = await fs.readFile(fullPath, 'utf8');
        const computedHash = generateHash(fileContent);

        if (computedHash !== expectedHash) {
          issues.push({
            severity: 'warning',
            message: `Modificação manual detectada no arquivo do sistema: ${relPath}`,
            file: relPath,
            fix: 'Valide se a modificação foi intencional ou execute sauron init para restaurar o padrão.',
          });
        }
      }
    }

    // 3. Valida a integridade do sumário e arquivos da wiki (.sauron/wiki/summary.json)
    const summaryPath = path.join(cwd, '.sauron', 'wiki', 'summary.json');
    if (!(await fs.pathExists(summaryPath))) {
      issues.push({
        severity: 'error',
        message: 'Arquivo de sumário da wiki (.sauron/wiki/summary.json) está ausente.',
        fix: 'Execute "sauron init" para restabelecer os diretórios base da wiki.',
      });
    } else {
      try {
        const summary = await fs.readJson(summaryPath);
        if (Array.isArray(summary)) {
          for (const item of summary) {
            if (item.type === 'file') {
              const fileRelPath = path.join('.sauron', 'wiki', item.path).replace(/\\/g, '/');
              const fileFullPath = path.join(cwd, '.sauron', 'wiki', item.path);

              if (!(await fs.pathExists(fileFullPath))) {
                issues.push({
                  severity: 'error',
                  message: `Documento catalogado no sumário está ausente: ${fileRelPath}`,
                  file: fileRelPath,
                  fix: `Recrie o arquivo correspondente ou remova-o de summary.json.`,
                });
                continue;
              }

              const content = await fs.readFile(fileFullPath, 'utf8');
              const computedHash = generateHash(content);
              const computedLen = Buffer.byteLength(content, 'utf8');

              if (item.contentHash && computedHash !== item.contentHash) {
                issues.push({
                  severity: 'warning',
                  message: `Divergência de assinatura criptográfica no documento da wiki: ${fileRelPath}`,
                  file: fileRelPath,
                  fix: `Atualize o summary.json com o novo hash: "${computedHash}" e tamanho: ${computedLen}.`,
                });
              }

              if (item.contentLength !== undefined && computedLen !== item.contentLength) {
                issues.push({
                  severity: 'warning',
                  message: `Divergência de tamanho de conteúdo (bytes) no documento: ${fileRelPath}`,
                  file: fileRelPath,
                  fix: `Atualize o summary.json com o novo tamanho em bytes: ${computedLen}.`,
                });
              }
            }
          }
        } else {
          issues.push({
            severity: 'error',
            message: 'summary.json possui formato estrutural inválido (deve ser um array de objetos).',
            fix: 'Corrija a formatação do JSON para seguir o padrão do Sauron CLI.',
          });
        }
      } catch (err: any) {
        issues.push({
          severity: 'error',
          message: `Falha ao ler o arquivo de sumário (JSON corrompido): ${err.message}`,
          fix: 'Valide a integridade do JSON de summary.json.',
        });
      }
    }

    // 4. Valida se os adaptadores de IAs configuradas estão presentes e ativos
    const targets = manifest?.config?.aiTargets
      || registered?.aiTargets
      || ['Cursor', 'Windsurf', 'Aider', 'Antigravity', 'Codex', 'Opencode', 'Claude'];
    for (const target of targets) {
      try {
        const adapters = AdapterRegistry.resolve([target]);
        if (adapters.length > 0) {
          const rulesFileMap: Record<string, string> = {
            'cursor': '.cursor/rules/sauron-memory.mdc',
            'windsurf': '.windsurf/rules/sauron-memory.md',
            'aider': '.sauron-aider-instructions.md',
            'antigravity': '.agents/rules/memory.md',
            'opencode': '.opencode/instructions/sauron-memory.md',
            'codex': '.codex/rules/sauron-memory.rules',
            'claude': '.claude/rules/sauron-base.md'
          };

          const relPath = rulesFileMap[target.toLowerCase().trim()];
          if (relPath) {
            const fullPath = path.join(cwd, relPath);
            if (!(await fs.pathExists(fullPath))) {
              issues.push({
                severity: 'error',
                message: `Configuração do agente ${target} está ausente ou foi deletada: ${relPath}`,
                fix: `Rode sauron init para reinjetar a integração com o ${target}.`,
              });
            } else {
              const rulesContent = await fs.readFile(fullPath, 'utf8');
              if (rulesContent.trim().length === 0) {
                issues.push({
                  severity: 'error',
                  message: `Arquivo de governança do Sauron está vazio em: ${relPath}`,
                  file: relPath,
                  fix: `Rode sauron init para restaurar as diretrizes de compliance no arquivo do agente.`,
                });
              }
            }
          }
        }
      } catch (e) {
        // Adaptador não suportado/registrado, ignora na checagem
      }
    }

    const hasErrors = issues.some((issue) => issue.severity === 'error');

    return {
      success: !hasErrors,
      issues,
    };
  }
}
