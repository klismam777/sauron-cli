import fs from 'fs-extra';
import path from 'path';
import { IAgentAdapter, IMemoryPayload } from '../interfaces/IAgentAdapter.js';

export class ClaudeAdapter implements IAgentAdapter {
  readonly id = 'claude';
  readonly displayName = 'Claude Code CLI';

  async detect(targetDir: string): Promise<boolean> {
    return fs.pathExists(path.join(targetDir, '.claude'));
  }

  async inject(payload: IMemoryPayload, targetDir: string): Promise<string[]> {
    const rulesDir = path.join(targetDir, '.claude', 'rules');
    await fs.ensureDir(rulesDir);
      
    const claudeRuleContent = `# Sauron Governance Directives
      
## Context Inheritance
As per architectural guidelines, Claude must persistently obey instructions centralized in the global ${payload.fallbackReference || 'AGENTS.md'} file within this project root.

## Local Addendum Context
${payload.globalRules}`;

    const outputPath = path.join(rulesDir, 'sauron-base.md');
    await fs.outputFile(outputPath, claudeRuleContent, 'utf-8');
    
    return ['.claude/rules/sauron-base.md'];
  }

  async clean(targetDir: string): Promise<string[]> {
    const rulesPath = path.join(targetDir, '.claude', 'rules', 'sauron-base.md');
    if (await fs.pathExists(rulesPath)) {
      await fs.remove(rulesPath);
      return ['.claude/rules/sauron-base.md'];
    }
    return [];
  }
}
