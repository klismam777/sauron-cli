import fs from 'fs-extra';
import path from 'path';
import { IAgentAdapter, IMemoryPayload } from '../interfaces/IAgentAdapter.js';

export class CursorAdapter implements IAgentAdapter {
  readonly id = 'cursor';
  readonly displayName = 'Cursor IDE Engine';

  async detect(targetDir: string): Promise<boolean> {
    return fs.pathExists(path.join(targetDir, '.cursor'));
  }

  async inject(payload: IMemoryPayload, targetDir: string): Promise<string[]> {
    const rulesDir = path.join(targetDir, '.cursor', 'rules');
    await fs.ensureDir(rulesDir);

    const mdcPath = path.join(rulesDir, 'sauron-memory.mdc');
    
    // Constrói a regra do Cursor com frontmatter padrão
    const mdcContent = `---
description: Diretrizes de Memória e Write Obligation para evitar Amnésia de Contexto
globs: ${payload.ruleScope || '*'}
---

# SAURON START
${payload.globalRules}
# SAURON END
`;

    await fs.writeFile(mdcPath, mdcContent, 'utf8');

    return ['.cursor/rules/sauron-memory.mdc'];
  }

  async clean(targetDir: string): Promise<string[]> {
    const mdcPath = path.join(targetDir, '.cursor', 'rules', 'sauron-memory.mdc');
    
    if (await fs.pathExists(mdcPath)) {
      await fs.remove(mdcPath);
      return ['.cursor/rules/sauron-memory.mdc'];
    }

    return [];
  }
}
