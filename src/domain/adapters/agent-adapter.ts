export interface AgentAdapter {
  getName(): string;
  inject(cwd: string, rulesContent: string): Promise<string[]>; // Retorna caminhos dos arquivos injetados/modificados relativos ao cwd
  clean(cwd: string): Promise<string[]>; // Retorna caminhos dos arquivos modificados/removidos relativos ao cwd
}
