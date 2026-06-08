import fs from 'fs-extra';
import path from 'path';
import { IAgentAdapter, IMemoryPayload } from '../interfaces/IAgentAdapter.js';

interface IOpencodeConfig {
  instructions?: string | string[];
  [key: string]: unknown;
}

export class OpencodeAdapter implements IAgentAdapter {
  readonly id = 'opencode';
  readonly displayName = 'Opencode Multi-Model Interface';

  async detect(targetDir: string): Promise<boolean> {
    return fs.pathExists(path.join(targetDir, 'opencode.json'));
  }

  async inject(payload: IMemoryPayload, targetDir: string): Promise<string[]> {
    const modifications: string[] = [];
    
    // 1. Gera o arquivo de instrução proprietário do Opencode
    const instructionDir = path.join(targetDir, '.opencode', 'instructions');
    await fs.ensureDir(instructionDir);
    const rulesPath = path.join(instructionDir, 'sauron-memory.md');
    await fs.outputFile(rulesPath, payload.globalRules, 'utf-8');
    modifications.push('.opencode/instructions/sauron-memory.md');

    // 2. Acopla estritamente os metadados JSON do Opencode 
    const configPath = path.join(targetDir, 'opencode.json');
    let configObj: IOpencodeConfig = {};
      
    if (await fs.pathExists(configPath)) {
      try {
        configObj = await fs.readJson(configPath);
      } catch (e) {
        throw new Error('Falha no parse do arquivo base opencode.json. JSON inválido detectado.');
      }
    }

    // Normalização agressiva para garantir escalabilidade da array instructions
    if (!Array.isArray(configObj.instructions)) {
      configObj.instructions = configObj.instructions ? [configObj.instructions as string] : [];
    }

    // Especificação orientada pelo padrão oficial de documentação
    const relativeRulesPath = '.opencode/instructions/sauron-memory.md';
    if (!configObj.instructions.includes(relativeRulesPath)) {
      configObj.instructions.push(relativeRulesPath);
      // fs-extra possibilita preservação com formatação (spacing param) para não quebrar a UI git do usuário final
      await fs.writeJson(configPath, configObj, { spaces: 2 }); 
      modifications.push('opencode.json');
    }

    return modifications;
  }

  async clean(targetDir: string): Promise<string[]> {
    const modifications: string[] = [];
    const rulesPath = path.join(targetDir, '.opencode', 'instructions', 'sauron-memory.md');
    
    if (await fs.pathExists(rulesPath)) {
      await fs.remove(rulesPath);
      modifications.push('.opencode/instructions/sauron-memory.md');
    }

    const configPath = path.join(targetDir, 'opencode.json');
    if (await fs.pathExists(configPath)) {
      try {
        const configObj: IOpencodeConfig = await fs.readJson(configPath);
        if (Array.isArray(configObj.instructions)) {
          const relativeRulesPath = '.opencode/instructions/sauron-memory.md';
          const newInstructions = configObj.instructions.filter(i => i !== relativeRulesPath);
          if (newInstructions.length !== configObj.instructions.length) {
            configObj.instructions = newInstructions;
            if (configObj.instructions.length === 0) delete configObj.instructions;
            
            if (Object.keys(configObj).length === 0) {
              await fs.remove(configPath);
            } else {
              await fs.writeJson(configPath, configObj, { spaces: 2 });
            }
            modifications.push('opencode.json');
          }
        }
      } catch (e) {
        // Ignora erros na desinstalação
      }
    }
    return modifications;
  }
}
