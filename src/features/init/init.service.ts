import fs from 'fs-extra';
import path from 'path';
import { getManifest, saveManifest, generateHash } from '../../core/manifest.service.js';
import { checkConflict } from '../../core/merge.service.js';
import { generateAgentsMarkdown } from './templates.js';
import { PresentationDriver } from '../../domain/adapters/presentation-driver.js';
import { RegistryService } from '../../core/registry/registry.service.js';
import { AdapterRegistry } from '../../core/adapters/index.js';
import { IMemoryPayload } from '../../core/interfaces/IAgentAdapter.js';
import { WikiBootstrapper } from '../../core/wiki/wiki-bootstrapper.js';

const ADAPTER_OWNED_TEMPLATE_FILES = new Set(['.agents/rules/memory.md']);

export interface InitOptions {
  aiTargets: string[];
  severity: string;
  projectContext: string;
  projectStack: string;
  cwd: string;
  templatesDir: string;
  wikiTemplatesToInject: string[];
}

function stripLeadingFrontmatter(content: string): string {
  let normalized = content.trimStart();
  let previous = '';

  while (normalized !== previous) {
    previous = normalized;
    normalized = normalized
      .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n*/, '')
      .trimStart();
  }

  return normalized;
}

function normalizeMemoryRules(content: string): string {
  const withoutMarkers = content
    .replace(/^\s*# SAURON START\s*$/gm, '')
    .replace(/^\s*# SAURON END\s*$/gm, '');

  const normalized = stripLeadingFrontmatter(withoutMarkers).trim();
  return normalized ? `${normalized}\n` : '';
}

async function loadCanonicalMemoryRules(
  templatesDir: string,
  fallbackContent: string
): Promise<string> {
  const templateMemoryPath = path.join(templatesDir, '.agents', 'rules', 'memory.md');
  const rawContent = (await fs.pathExists(templateMemoryPath))
    ? await fs.readFile(templateMemoryPath, 'utf8')
    : fallbackContent;

  return normalizeMemoryRules(rawContent) || `${fallbackContent.trim()}\n`;
}

export class InitService {
  private registryService = new RegistryService();

  async execute(
    options: InitOptions,
    driver: PresentationDriver
  ): Promise<string[]> {
    const { cwd, templatesDir } = options;
    const manifest = (await getManifest(cwd)) || { version: '1.0.0', files: {} };
    const modifiedFiles: string[] = [];

    const processDirectory = async (source: string, target: string) => {
      if (!(await fs.pathExists(source))) return;

      const files = await fs.readdir(source);
      for (const file of files) {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);
        const stat = await fs.stat(sourcePath);

        if (stat.isDirectory()) {
          const relativeToTarget = path.relative(cwd, targetPath).replace(/\\/g, '/');
          if (relativeToTarget === '.sauron/wiki' && await fs.pathExists(targetPath)) {
            continue;
          }
          await fs.ensureDir(targetPath);
          await processDirectory(sourcePath, targetPath);
        } else {
          const relPath = path.relative(cwd, targetPath).replace(/\\/g, '/');
          if (ADAPTER_OWNED_TEMPLATE_FILES.has(relPath)) {
            continue;
          }

          const content = await fs.readFile(sourcePath, 'utf8');
          let shouldWrite = true;

          if (await fs.pathExists(targetPath)) {
            const localContent = await fs.readFile(targetPath, 'utf8');
            const hasConflict = checkConflict(localContent, content, manifest.files[relPath]);

            if (hasConflict) {
              const decision = await driver.resolveConflict(relPath, localContent, content);
              if (decision === 'ours') {
                shouldWrite = false;
              }
            }
          } else {
            await fs.ensureDir(path.dirname(targetPath));
          }

          if (shouldWrite) {
            await fs.writeFile(targetPath, content, 'utf8');
            modifiedFiles.push(relPath);
          }

          const isMutable = relPath.startsWith('.sauron/wiki/');
          if (!isMutable) {
            manifest.files[relPath] = generateHash(content);
          }
        }
      }
    };

    await processDirectory(path.join(templatesDir, '.sauron'), path.join(cwd, '.sauron'));
    await processDirectory(path.join(templatesDir, '.agents'), path.join(cwd, '.agents'));

    const agentsMdPath = path.join(cwd, 'AGENTS.md');
    const agentsMdContent = generateAgentsMarkdown(
      options.aiTargets,
      options.severity,
      options.projectContext,
      options.projectStack
    );

    let shouldWriteAgents = true;
    if (await fs.pathExists(agentsMdPath)) {
      const localAgents = await fs.readFile(agentsMdPath, 'utf8');
      const hasConflict = checkConflict(localAgents, agentsMdContent, manifest.files['AGENTS.md']);

      if (hasConflict) {
        const decision = await driver.resolveConflict('AGENTS.md', localAgents, agentsMdContent);
        if (decision === 'ours') {
          shouldWriteAgents = false;
        }
      }
    }

    if (shouldWriteAgents) {
      await fs.writeFile(agentsMdPath, agentsMdContent, 'utf8');
      modifiedFiles.push('AGENTS.md');
    }
    manifest.files['AGENTS.md'] = generateHash(agentsMdContent);

    manifest.config = {
      aiTargets: options.aiTargets,
      severity: options.severity,
      projectContext: options.projectContext,
      projectStack: options.projectStack,
    };
    await saveManifest(cwd, manifest);
    modifiedFiles.push('.sauron/.manifest.json');

    const memoryRulesContent = await loadCanonicalMemoryRules(templatesDir, agentsMdContent);
    const projectName = path.basename(cwd) || 'Unnamed Project';

    const memoryPayload: IMemoryPayload = {
      projectName,
      globalRules: memoryRulesContent,
      ruleScope: '**/*.{ts,js,tsx,jsx}',
      fallbackReference: 'AGENTS.md',
    };

    try {
      const adapters = AdapterRegistry.resolve(options.aiTargets);
      for (const adapter of adapters) {
        const paths = await adapter.inject(memoryPayload, cwd);
        modifiedFiles.push(...paths);
      }
    } catch (error: any) {
      throw new Error(`Erro ao orquestrar adaptadores: ${error.message}`);
    }

    const bootstrapper = new WikiBootstrapper(cwd);
    const injectedWikiFiles = await bootstrapper.bootstrapFromTemplates(
      templatesDir,
      options.wikiTemplatesToInject
    );
    modifiedFiles.push(...injectedWikiFiles);

    await this.registryService.registerWorkspace(
      projectName,
      cwd,
      options.aiTargets,
      options.severity
    );

    return modifiedFiles;
  }
}
