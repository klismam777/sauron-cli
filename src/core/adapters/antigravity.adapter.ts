import fs from 'fs-extra';
import path from 'path';
import { IAgentAdapter, IMemoryPayload } from '../interfaces/IAgentAdapter.js';

export class AntigravityAdapter implements IAgentAdapter {
  readonly id = 'antigravity';
  readonly displayName = 'Antigravity IDE Engine';

  async detect(targetDir: string): Promise<boolean> {
    return fs.pathExists(path.join(targetDir, '.agents'));
  }

  async inject(payload: IMemoryPayload, targetDir: string): Promise<string[]> {
    const rulesPath = path.join(targetDir, '.agents', 'rules', 'memory.md');
    await fs.ensureDir(path.dirname(rulesPath));

    const content = `---
trigger: always_on
---

# SAURON START
${payload.globalRules}
# SAURON END
`;

    await fs.writeFile(rulesPath, content, 'utf8');

    return ['.agents/rules/memory.md'];
  }

  async clean(targetDir: string): Promise<string[]> {
    const agentsDir = path.join(targetDir, '.agents');
    if (await fs.pathExists(agentsDir)) {
      await fs.remove(agentsDir);
      return ['.agents/rules/memory.md', '.agents/skills/wiki/SKILL.md'];
    }

    return [];
  }
}
