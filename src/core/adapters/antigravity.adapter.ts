import fs from 'fs-extra';
import path from 'path';
import { AgentAdapter } from '../../domain/adapters/agent-adapter.js';

export class AntigravityAdapter implements AgentAdapter {
  getName(): string {
    return 'Antigravity';
  }

  async inject(cwd: string, rulesContent: string): Promise<string[]> {
    const rulesPath = path.join(cwd, '.agents', 'rules', 'memory.md');
    await fs.ensureDir(path.dirname(rulesPath));

    const content = `---
trigger: always_on
---

# SAURON START
${rulesContent}
# SAURON END
`;

    await fs.writeFile(rulesPath, content, 'utf8');

    return ['.agents/rules/memory.md'];
  }

  async clean(cwd: string): Promise<string[]> {
    const agentsDir = path.join(cwd, '.agents');
    if (await fs.pathExists(agentsDir)) {
      await fs.remove(agentsDir);
      return ['.agents/rules/memory.md', '.agents/skills/wiki/SKILL.md'];
    }

    return [];
  }
}
