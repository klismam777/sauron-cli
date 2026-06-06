import fs from 'fs-extra';
import path from 'path';
import { AgentAdapter } from '../../domain/adapters/agent-adapter.js';

export class CursorAdapter implements AgentAdapter {
  getName(): string {
    return 'Cursor';
  }

  async inject(cwd: string, rulesContent: string): Promise<string[]> {
    const rulesDir = path.join(cwd, '.cursor', 'rules');
    await fs.ensureDir(rulesDir);

    const mdcPath = path.join(rulesDir, 'sauron-memory.mdc');
    
    // Constrói a regra do Cursor com frontmatter padrão
    const mdcContent = `---
description: Diretrizes de Memória e Write Obligation para evitar Amnésia de Contexto
globs: *
---

# SAURON START
${rulesContent}
# SAURON END
`;

    await fs.writeFile(mdcPath, mdcContent, 'utf8');

    return ['.cursor/rules/sauron-memory.mdc'];
  }

  async clean(cwd: string): Promise<string[]> {
    const mdcPath = path.join(cwd, '.cursor', 'rules', 'sauron-memory.mdc');
    
    if (await fs.pathExists(mdcPath)) {
      await fs.remove(mdcPath);
      return ['.cursor/rules/sauron-memory.mdc'];
    }

    return [];
  }
}
