import fs from 'fs-extra';
import path from 'path';
import { AgentAdapter } from '../../domain/adapters/agent-adapter.js';

export class AiderAdapter implements AgentAdapter {
  getName(): string {
    return 'Aider';
  }

  async inject(cwd: string, rulesContent: string): Promise<string[]> {
    const rulesPath = path.join(cwd, '.aider.instructions.md');
    
    const content = `# SAURON START
${rulesContent}
# SAURON END
`;

    await fs.writeFile(rulesPath, content, 'utf8');

    return ['.aider.instructions.md'];
  }

  async clean(cwd: string): Promise<string[]> {
    const rulesPath = path.join(cwd, '.aider.instructions.md');
    if (await fs.pathExists(rulesPath)) {
      await fs.remove(rulesPath);
      return ['.aider.instructions.md'];
    }

    return [];
  }
}
