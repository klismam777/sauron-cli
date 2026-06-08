import { IAgentAdapter } from '../interfaces/IAgentAdapter.js';

export class AdapterRegistry {
  private static adapters: Map<string, IAgentAdapter> = new Map();

  public static register(adapter: IAgentAdapter): void {
    if (this.adapters.has(adapter.id)) {
      throw new Error(`Conflito: Adaptador com ID '${adapter.id}' já foi registrado no ecossistema.`);
    }
    this.adapters.set(adapter.id, adapter);
  }

  public static resolve(ids: string[]): IAgentAdapter[] {
    const resolvedAdapters: IAgentAdapter[] = [];

    for (const id of ids) {
      const normalizedId = id.toLowerCase().trim();
      const adapterInstance = this.adapters.get(normalizedId);
        
      if (!adapterInstance) {
        throw new Error(`Falha Crítica: Agente AI '${id}' não é suportado pela versão atual.`);
      }
      resolvedAdapters.push(adapterInstance);
    }
      
    return resolvedAdapters;
  }

  public static getAll(): IAgentAdapter[] {
    return Array.from(this.adapters.values());
  }
}
