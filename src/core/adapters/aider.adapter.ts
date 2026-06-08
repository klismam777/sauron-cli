import fs from 'fs-extra';
import path from 'path';
import * as yaml from 'js-yaml';
import { IAgentAdapter, IMemoryPayload } from '../interfaces/IAgentAdapter.js';

interface IAiderConfig {
  read?: string | string[];
  [key: string]: unknown;
}

function isAiderConfigValid(config: unknown): config is IAiderConfig {
  return typeof config === 'object' && config !== null;
}

export class AiderAdapter implements IAgentAdapter {
  readonly id = 'aider';
  readonly displayName = 'Aider Agent CLI';

  async detect(targetDir: string): Promise<boolean> {
    return fs.pathExists(path.join(targetDir, '.aider.conf.yml'));
  }

  async inject(payload: IMemoryPayload, targetDir: string): Promise<string[]> {
    const modifications: string[] = [];
    const memoryFileName = '.sauron-aider-instructions.md';
    const instructionsPath = path.join(targetDir, memoryFileName);
      
    // 1. Gera a âncora de convenção física que o YAML referenciará 
    await fs.outputFile(instructionsPath, payload.globalRules, 'utf-8');
    modifications.push(memoryFileName);

    const configPath = path.join(targetDir, '.aider.conf.yml');
    let configObj: unknown = {};
      
    // 2. Extrai e faz o parsing seguro com checagem assíncrona
    if (await fs.pathExists(configPath)) {
      try {
        const configStr = await fs.readFile(configPath, 'utf8');
        configObj = yaml.load(configStr) || {};
      } catch (err) {
        throw new Error(`O YAML subjacente em ${configPath} está corrompido ou malformado.`);
      }
    }

    // 3. Aplica garantias de Type Guard no fluxo de ramificação lógica
    if (isAiderConfigValid(configObj)) {
      if (!configObj.read) {
        configObj.read = [];
      } else if (typeof configObj.read === 'string') {
        configObj.read = [configObj.read];
      }

      if (Array.isArray(configObj.read) && !configObj.read.includes(memoryFileName)) {
        configObj.read.push(memoryFileName);
      }
        
      // 4. Executa um dump reverso e seguro reconstruindo identações apropriadas
      const newYamlDump = yaml.dump(configObj, { indent: 2, lineWidth: -1 });
      await fs.outputFile(configPath, newYamlDump, 'utf-8');
      modifications.push('.aider.conf.yml');
    } else {
      throw new Error("Falha no cast. A estrutura lida do '.aider.conf.yml' não corresponde a um objeto mapeável.");
    }

    // Limpar o arquivo antigo caso o usuário esteja migrando (.aider.instructions.md)
    const oldPath = path.join(targetDir, '.aider.instructions.md');
    if (await fs.pathExists(oldPath)) {
      await fs.remove(oldPath);
      modifications.push('.aider.instructions.md');
    }

    return modifications;
  }

  async clean(targetDir: string): Promise<string[]> {
    const modifications: string[] = [];
    const memoryFileName = '.sauron-aider-instructions.md';
    const instructionsPath = path.join(targetDir, memoryFileName);

    if (await fs.pathExists(instructionsPath)) {
      await fs.remove(instructionsPath);
      modifications.push(memoryFileName);
    }

    const configPath = path.join(targetDir, '.aider.conf.yml');
    if (await fs.pathExists(configPath)) {
      try {
        const configStr = await fs.readFile(configPath, 'utf8');
        const configObj = yaml.load(configStr);

        if (isAiderConfigValid(configObj) && Array.isArray(configObj.read)) {
          const newRead = configObj.read.filter((p: string) => p !== memoryFileName);
          if (newRead.length !== configObj.read.length) {
            configObj.read = newRead;
            // Se ficou vazio, remove a propriedade read para manter limpo
            if (configObj.read.length === 0) delete configObj.read;
            
            const newYamlDump = yaml.dump(configObj, { indent: 2, lineWidth: -1 });
            
            // Se o arquivo ficou vazio, apaga ele todo
            if (Object.keys(configObj).length === 0) {
                await fs.remove(configPath);
            } else {
                await fs.outputFile(configPath, newYamlDump, 'utf-8');
            }
            modifications.push('.aider.conf.yml');
          }
        }
      } catch (err) {
        // Ignora erros de parse na limpeza
      }
    }

    // Tentar limpar o arquivo antigo se existir
    const oldPath = path.join(targetDir, '.aider.instructions.md');
    if (await fs.pathExists(oldPath)) {
      await fs.remove(oldPath);
      modifications.push('.aider.instructions.md');
    }

    return modifications;
  }
}
