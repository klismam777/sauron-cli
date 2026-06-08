import fs from 'fs-extra';
import path from 'path';
import { IAgentAdapter, IMemoryPayload } from '../interfaces/IAgentAdapter.js';

export class WindsurfAdapter implements IAgentAdapter {
  readonly id = 'windsurf';
  readonly displayName = 'Windsurf by Codeium';

  async detect(targetDir: string): Promise<boolean> {
    return fs.pathExists(path.join(targetDir, '.windsurf'));
  }

  async inject(payload: IMemoryPayload, targetDir: string): Promise<string[]> {
    const modifications: string[] = [];
    const rulesDir = path.join(targetDir, '.windsurf', 'rules');
    await fs.ensureDir(rulesDir);

    const ruleContent = `---
description: "Sauron Memory Override - Universal Guidelines and Base Types"
trigger: always_on
---

# Overarching Project Context
${payload.globalRules}

*Note: For dynamic capabilities, rely on native skill sets; for fundamental structures, observe these bounds.*
`;

    const mdPath = path.join(rulesDir, 'sauron-memory.md');
    await fs.outputFile(mdPath, ruleContent, 'utf-8');
    modifications.push('.windsurf/rules/sauron-memory.md');

    // Clean old format just in case
    const oldPath = path.join(targetDir, '.windsurfrules');
    if (await fs.pathExists(oldPath)) {
      const localContent = await fs.readFile(oldPath, 'utf8');
      const cleanedContent = this.removeSauronBlock(localContent).trim();
      if (cleanedContent === '') {
        await fs.remove(oldPath);
      } else {
        await fs.writeFile(oldPath, cleanedContent + '\n', 'utf8');
      }
      modifications.push('.windsurfrules');
    }

    return modifications;
  }

  async clean(targetDir: string): Promise<string[]> {
    const modifications: string[] = [];
    const mdPath = path.join(targetDir, '.windsurf', 'rules', 'sauron-memory.md');
    
    if (await fs.pathExists(mdPath)) {
      await fs.remove(mdPath);
      modifications.push('.windsurf/rules/sauron-memory.md');
    }

    const oldPath = path.join(targetDir, '.windsurfrules');
    if (await fs.pathExists(oldPath)) {
      const localContent = await fs.readFile(oldPath, 'utf8');
      const cleanedContent = this.removeSauronBlock(localContent).trim();
      if (cleanedContent === '') {
        await fs.remove(oldPath);
      } else {
        await fs.writeFile(oldPath, cleanedContent + '\n', 'utf8');
      }
      modifications.push('.windsurfrules');
    }

    return modifications;
  }

  private removeSauronBlock(content: string): string {
    const regex = /# SAURON START[\s\S]*?# SAURON END/g;
    return content.replace(regex, '').trim();
  }
}
