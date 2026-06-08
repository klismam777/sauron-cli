import fs from 'fs-extra';
import path from 'path';
import { TECHNOLOGY_SIGNATURES, TechnologySignature } from './signatures.js';

export interface ProjectContextInfo {
  primaryLanguage: string;
  frameworks: string[];
  database: string[];
  styling: string[];
  packageManager: string;
  isMonorepo: boolean;
  detectedIAs: string[];
  wikiTemplatesToInject: string[];
}

export class ProjectScanner {
  private readonly cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  public async scan(): Promise<ProjectContextInfo> {
    const context: ProjectContextInfo = {
      primaryLanguage: 'JavaScript', // Fallback padrão
      frameworks: [],
      database: [],
      styling: [],
      packageManager: 'npm',
      isMonorepo: false,
      detectedIAs: [],
      wikiTemplatesToInject: [],
    };

    try {
      // 1. Leitura superficial rápida O(1) com withFileTypes na raiz
      const rootEntries = await fs.readdir(this.cwd, { withFileTypes: true });
      const rootFiles = rootEntries.filter((e) => e.isFile()).map((e) => e.name);
      const rootDirs = rootEntries.filter((e) => e.isDirectory()).map((e) => e.name);

      // 2. Inferência de Package Manager e Topologia Monorepo
      if (rootFiles.includes('pnpm-lock.yaml') || rootFiles.includes('pnpm-workspace.yaml')) {
        context.packageManager = 'pnpm';
        if (rootFiles.includes('pnpm-workspace.yaml')) {
          context.isMonorepo = true;
        }
      } else if (rootFiles.includes('yarn.lock')) {
        context.packageManager = 'yarn';
      } else if (rootFiles.includes('package-lock.json')) {
        context.packageManager = 'npm';
      }

      // 3. Detecção de Linguagem Primária
      if (rootFiles.includes('tsconfig.json')) {
        context.primaryLanguage = 'TypeScript';
      }

      // 4. Detecção das IDEs / IAs no Workspace local
      this.addDetectedIA(context, rootDirs.includes('.cursor') || rootFiles.includes('.cursorrules'), 'Cursor');
      this.addDetectedIA(context, rootDirs.includes('.windsurf') || rootFiles.includes('.windsurfrules'), 'Windsurf');
      this.addDetectedIA(context, rootFiles.includes('.aider.instructions.md') || rootFiles.includes('.aider.conf.yml'), 'Aider');
      this.addDetectedIA(context, rootDirs.includes('.agents'), 'Antigravity');
      this.addDetectedIA(context, rootDirs.includes('.codex'), 'Codex');
      this.addDetectedIA(context, rootDirs.includes('.opencode') || rootFiles.includes('opencode.json'), 'Opencode');
      this.addDetectedIA(context, rootDirs.includes('.claude') || rootFiles.includes('CLAUDE.md'), 'Claude');
      
      // Fallback: se nenhuma IA for detectada de antemão, sugere todas
      if (context.detectedIAs.length === 0) {
        context.detectedIAs = ['Cursor', 'Windsurf', 'Aider', 'Antigravity', 'Codex', 'Opencode', 'Claude'];
      }

      // 5. Analisa dependências do package.json se existir
      if (rootFiles.includes('package.json')) {
        const pkgPath = path.join(this.cwd, 'package.json');
        const pkg = await fs.readJson(pkgPath);

        const allDeps: Record<string, string> = {
          ...(pkg.dependencies || {}),
          ...(pkg.devDependencies || {}),
        };

        // Roda as heurísticas das assinaturas tecnológicas
        for (const sig of TECHNOLOGY_SIGNATURES) {
          let matched = false;

          // Valida por dependências
          if (sig.deps && sig.deps.some((dep) => allDeps[dep])) {
            matched = true;
          }

          // Valida por arquivos físicos
          if (sig.files) {
            for (const marker of sig.files) {
              if (await this.matchesFileMarker(marker, rootFiles, rootDirs)) {
                matched = true;
                break;
              }
            }
          }

          if (matched) {
            this.categorizeAndAdd(sig, context);
          }
        }
      }

      // 6. Varredura leve de docker-compose / compose se existirem
      const composeFiles = ['compose.yml', 'docker-compose.yml'];
      for (const composeFile of composeFiles) {
        if (rootFiles.includes(composeFile)) {
          const composePath = path.join(this.cwd, composeFile);
          const composeContent = await fs.readFile(composePath, 'utf8');

          for (const sig of TECHNOLOGY_SIGNATURES) {
            if (sig.regex && sig.regex.file === composeFile) {
              if (sig.regex.pattern.test(composeContent)) {
                this.categorizeAndAdd(sig, context);
              }
            }
          }
        }
      }

    } catch (error) {
      console.warn('O Scanner de Arquitetura do Sauron encontrou um atrito de I/O não-fatal: ', error);
    }

    return context;
  }

  private categorizeAndAdd(sig: TechnologySignature, context: ProjectContextInfo): void {
    const name = sig.name;

    // Classifica as frameworks de estilização, bancos ou frameworks gerais
    if (name.toLowerCase().includes('tailwind') || name.toLowerCase().includes('styled')) {
      if (!context.styling.includes(name)) context.styling.push(name);
    } else if (name.toLowerCase().includes('postgres') || name.toLowerCase().includes('prisma') || name.toLowerCase().includes('redis') || name.toLowerCase().includes('mongo')) {
      if (!context.database.includes(name)) context.database.push(name);
    } else {
      if (name !== 'TypeScript' && !context.frameworks.includes(name)) {
        context.frameworks.push(name);
      }
    }

    if (sig.wikiTemplate && !context.wikiTemplatesToInject.includes(sig.wikiTemplate)) {
      context.wikiTemplatesToInject.push(sig.wikiTemplate);
    }
  }

  private addDetectedIA(context: ProjectContextInfo, condition: boolean, name: string): void {
    if (condition && !context.detectedIAs.includes(name)) {
      context.detectedIAs.push(name);
    }
  }

  private async matchesFileMarker(
    marker: string,
    rootFiles: string[],
    rootDirs: string[]
  ): Promise<boolean> {
    if (!marker.includes('/') && !marker.includes('\\')) {
      return rootFiles.includes(marker) || rootDirs.includes(marker);
    }

    return fs.pathExists(path.join(this.cwd, marker));
  }
}
