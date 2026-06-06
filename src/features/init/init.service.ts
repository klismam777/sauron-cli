import fs from 'fs-extra';
import path from 'path';
import { getManifest, saveManifest, generateHash, Manifest } from '../../core/manifest.service.js';
import { checkConflict } from '../../core/merge.service.js';
import { generateAgentsMarkdown } from './templates.js';

export interface InitOptions {
  aiTargets: string[];
  severity: string;
  projectContext: string;
  projectStack: string;
  cwd: string;
  templatesDir: string;
}

export class InitService {
  async execute(
    options: InitOptions,
    onConflict: (filePath: string, localContent: string, newContent: string) => Promise<'ours' | 'theirs'>
  ) {
    const { cwd, templatesDir } = options;
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
            const hasConflict = checkConflict(localContent, content, manifest.files[relPath]);
            
            if (hasConflict) {
              const decision = await onConflict(relPath, localContent, content);
              if (decision === 'ours') {
                shouldWrite = false;
              }
            }
          } else {
            await fs.ensureDir(path.dirname(targetPath));
          }

          if (shouldWrite) {
            await fs.writeFile(targetPath, content, 'utf8');
          }

          manifest.files[relPath] = generateHash(content);
        }
      }
    }

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
        const decision = await onConflict('AGENTS.md', localAgents, agentsMdContent);
        if (decision === 'ours') {
          shouldWriteAgents = false;
        }
      }
    }

    if (shouldWriteAgents) {
      await fs.writeFile(agentsMdPath, agentsMdContent, 'utf8');
    }
    manifest.files['AGENTS.md'] = generateHash(agentsMdContent);

    await saveManifest(cwd, manifest);
  }
}
