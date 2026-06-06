import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';
import { getManifest, saveManifest, generateHash, Manifest } from '../engine/manifest.js';
import { resolveConflict } from '../engine/merge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runInit(options: { yes?: boolean }) {
  const cwd = process.cwd();
  const logo = `
\x1b[38;2;255;106;0m ██████  █████  ██    ██ ██████  ██████  ███    ██\x1b[0m
\x1b[38;2;255;179;0m██      ██   ██ ██    ██ ██   ██ ██   ██ ████   ██\x1b[0m
\x1b[38;2;255;215;0m╚█████╗ ███████ ██    ██ ██████  ██   ██ ██ ██  ██\x1b[0m
\x1b[38;2;255;140;0m     ██ ██   ██ ██    ██ ██   ██ ██   ██ ██  ██ ██\x1b[0m
\x1b[38;2;204;51;0m██████  ██   ██  ██████  ██   ██ ██████  ██   ████\x1b[0m
`;

  console.log(pc.bold(logo));
  console.log(pc.dim('  CLI de Idempotência e Memória para IAs\n'));

  p.intro(pc.bgRed(pc.white(' 👁️ Sauron Memory System - Inicialização ')));
  let aiTargets = ['Cursor', 'Windsurf', 'Aider', 'Antigravity'];
  let severity = 'Observacional';
  let projectContext = 'Projeto Genérico';
  let projectStack = 'Node.js, TypeScript';

  if (!options.yes) {
    const config = await p.group(
      {
        targets: () =>
          p.multiselect({
            message: 'Qual(is) IA(s) você usará neste projeto?',
            options: [
              { value: 'Cursor', label: 'Cursor', hint: 'Recomendado' },
              { value: 'Windsurf', label: 'Windsurf' },
              { value: 'Aider', label: 'Aider' },
              { value: 'Antigravity', label: 'Antigravity', hint: 'Agente nativo' },
            ],
            required: false,
          }),
        severity: () =>
          p.select({
            message: 'Qual o nível de severidade das regras da IA?',
            options: [
              { value: 'Observacional', label: 'Observacional (A IA documenta quando julgar necessário)' },
              { value: 'Estrito', label: 'Estrito (Bloqueia alterações sem documentação explícita)' },
            ],
          }),
        context: () =>
          p.text({
            message: 'Descreva brevemente o contexto do seu projeto:',
            placeholder: 'Ex: App de agendamento de pilates',
            defaultValue: 'Projeto Genérico',
          }),
        stack: () =>
          p.text({
            message: 'Qual a stack tecnológica principal do seu projeto?',
            placeholder: 'Ex: Next.js 15, Tailwind, Firebase',
            defaultValue: 'Node.js, TypeScript',
          }),
      },
      {
        onCancel: () => {
          p.cancel('Inicialização abortada.');
          process.exit(0);
        },
      }
    );

    aiTargets = config.targets as string[];
    severity = config.severity as string;
    projectContext = config.context as string;
    projectStack = config.stack as string;
  }

  const s = p.spinner();
  s.start('Injetando o Cérebro da IA no repositório...');

  const packageRoot = path.join(__dirname, '..', '..'); // Volta de dist/commands para raiz
  const templatesDir = path.join(packageRoot, 'templates');
  
  const manifest = (await getManifest(cwd)) || { version: '1.0.0', files: {} };
  
  async function processDirectory(source: string, target: string) {
    if (!(await fs.pathExists(source))) return;
    
    const files = await fs.readdir(source);
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);
      const stat = await fs.stat(sourcePath);

      if (stat.isDirectory()) {
        await fs.ensureDir(targetPath);
        await processDirectory(sourcePath, targetPath);
      } else {
        const content = await fs.readFile(sourcePath, 'utf8');
        const relPath = path.relative(cwd, targetPath).replace(/\\/g, '/');
        
        let shouldWrite = true;

        if (await fs.pathExists(targetPath)) {
          const localContent = await fs.readFile(targetPath, 'utf8');
          s.stop(`Conflito ou atualização em ${relPath}`);
          const decision = await resolveConflict(relPath, localContent, content, manifest.files[relPath]);
          s.start('Continuando injeção...');
          
          if (decision === 'ours') {
            shouldWrite = false;
          }
        } else {
          await fs.ensureDir(path.dirname(targetPath));
        }

        if (shouldWrite) {
          await fs.writeFile(targetPath, content, 'utf8');
        }

        // Atualiza manifesto com a hash do template original SEMPRE
        manifest.files[relPath] = generateHash(content);
      }
    }
  }

  await processDirectory(path.join(templatesDir, '.sauron'), path.join(cwd, '.sauron'));
  await processDirectory(path.join(templatesDir, '.agents'), path.join(cwd, '.agents'));

  // Gerar AGENTS.md raiz
  const agentsMdPath = path.join(cwd, 'AGENTS.md');
  const agentsMdContent = `# Diretrizes Globais de Agentes (Sauron CLI)

**Alvos:** ${aiTargets.join(', ')}
**Severidade:** ${severity}

## Contexto do Projeto
${projectContext}

## Stack Tecnológica
${projectStack}

## Regra de Ouro (Write Obligation)
Todos os agentes operando neste repositório estão estritamente obrigados a documentar qualquer alteração arquitetural, de regra de negócio ou mutação de estado nas pastas \`.sauron\` e \`.agents\` correspondentes. A leitura passiva sem documentação é considerada quebra de compliance.

*Gerado automaticamente pelo Sauron CLI.*
`;

  let shouldWriteAgents = true;
  if (await fs.pathExists(agentsMdPath)) {
    const localAgents = await fs.readFile(agentsMdPath, 'utf8');
    s.stop(`Conflito em AGENTS.md`);
    const decision = await resolveConflict('AGENTS.md', localAgents, agentsMdContent, manifest.files['AGENTS.md']);
    s.start('Finalizando...');
    if (decision === 'ours') shouldWriteAgents = false;
  }
  
  if (shouldWriteAgents) {
    await fs.writeFile(agentsMdPath, agentsMdContent, 'utf8');
  }
  manifest.files['AGENTS.md'] = generateHash(agentsMdContent);

  await saveManifest(cwd, manifest);
  s.stop('Injeção finalizada.');

  p.outro(
    pc.green(pc.bold('Sauron Memory System instalado com sucesso! 👁️\n\n')) +
    pc.white('O Cérebro da IA foi injetado e protegido pelo motor de integridade.\n') +
    pc.cyan('Ações Recomendadas:\n') +
    pc.dim('Copie o comando abaixo e envie para a sua IA testar a nova arquitetura:\n') +
    pc.yellow('"Analise a estrutura .sauron/ e .agents/ recém injetada e sugira quais regras críticas eu devo documentar agora para nosso projeto."')
  );
}
