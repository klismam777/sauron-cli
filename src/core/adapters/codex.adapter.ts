import fs from 'fs-extra';
import path from 'path';
import { IAgentAdapter, IMemoryPayload } from '../interfaces/IAgentAdapter.js';

export class CodexAdapter implements IAgentAdapter {
  readonly id = 'codex';
  readonly displayName = 'Codex Local Sandbox';

  async detect(targetDir: string): Promise<boolean> {
    return fs.pathExists(path.join(targetDir, '.codex'));
  }

  async inject(payload: IMemoryPayload, targetDir: string): Promise<string[]> {
    const rulesDir = path.join(targetDir, '.codex', 'rules');
    await fs.ensureDir(rulesDir);

    const codexPolicy = `prompt: true
allow:
  - read: .sauron/wiki/**
  - read: AGENTS.md
  
# Sauron Central Governance Policy
${payload.globalRules}
`;

    const outputPath = path.join(rulesDir, 'sauron-memory.rules');
    await fs.outputFile(outputPath, codexPolicy, 'utf-8');
    
    return ['.codex/rules/sauron-memory.rules'];
  }

  async clean(targetDir: string): Promise<string[]> {
    const rulesPath = path.join(targetDir, '.codex', 'rules', 'sauron-memory.rules');
    if (await fs.pathExists(rulesPath)) {
      await fs.remove(rulesPath);
      return ['.codex/rules/sauron-memory.rules'];
    }
    return [];
  }
}
