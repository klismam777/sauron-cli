import fs from 'fs-extra';
import path from 'path';
import { RegistryService } from '../../core/registry/registry.service.js';
import { AdapterFactory } from '../../core/adapters/adapter.factory.js';

export interface UninstallOptions {
  cwd: string;
  purge: boolean;
}

export class UninstallService {
  private registryService = new RegistryService();

  public async execute(options: UninstallOptions): Promise<string[]> {
    const { cwd, purge } = options;
    const removedPaths: string[] = [];

    // 1. Remove o projeto do registro global centralizado (~/.sauron/registry.json)
    await this.registryService.unregisterWorkspace(cwd);
    removedPaths.push('~/.sauron/registry.json (descadastrado)');

    // 2. Executa a limpeza em cada adaptador de agente conhecido
    const adapters = AdapterFactory.getAllAdapters();
    for (const adapter of adapters) {
      const paths = await adapter.clean(cwd);
      removedPaths.push(...paths);
    }

    // 3. Remove o arquivo global AGENTS.md se existir
    const agentsMdPath = path.join(cwd, 'AGENTS.md');
    if (await fs.pathExists(agentsMdPath)) {
      await fs.remove(agentsMdPath);
      removedPaths.push('AGENTS.md');
    }

    // 4. Trata a preservação ou purga da pasta .sauron/
    const sauronDir = path.join(cwd, '.sauron');
    if (await fs.pathExists(sauronDir)) {
      if (purge) {
        // Exclui tudo fisicamente
        await fs.remove(sauronDir);
        removedPaths.push('.sauron/ (purgado por completo)');
      } else {
        // Preserva a wiki e exclui apenas o manifesto
        const manifestPath = path.join(sauronDir, '.manifest.json');
        if (await fs.pathExists(manifestPath)) {
          await fs.remove(manifestPath);
          removedPaths.push('.sauron/.manifest.json');
        }
        removedPaths.push('.sauron/wiki/ (preservado como base estática)');
      }
    }

    return removedPaths;
  }
}
