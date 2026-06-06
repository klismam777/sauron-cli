import fs from 'fs-extra';
import path from 'path';
import { AgentAdapter } from '../../domain/adapters/agent-adapter.js';

export class WindsurfAdapter implements AgentAdapter {
  getName(): string {
    return 'Windsurf';
  }

  async inject(cwd: string, rulesContent: string): Promise<string[]> {
    const rulesPath = path.join(cwd, '.windsurfrules');
    let localContent = '';

    if (await fs.pathExists(rulesPath)) {
      localContent = await fs.readFile(rulesPath, 'utf8');
    }

    // Remove qualquer bloco de marcação do Sauron anterior
    const cleanedContent = this.removeSauronBlock(localContent);

    // Constrói a regra estruturada com metamarcações
    const sauronBlock = `\n# SAURON START\n${rulesContent}\n# SAURON END\n`;
    
    // Une o conteúdo original limpo com o bloco do Sauron
    const finalContent = (cleanedContent.trim() + '\n' + sauronBlock).trim() + '\n';

    await fs.writeFile(rulesPath, finalContent, 'utf8');

    return ['.windsurfrules'];
  }

  async clean(cwd: string): Promise<string[]> {
    const rulesPath = path.join(cwd, '.windsurfrules');
    if (!(await fs.pathExists(rulesPath))) {
      return [];
    }

    const localContent = await fs.readFile(rulesPath, 'utf8');
    const cleanedContent = this.removeSauronBlock(localContent).trim();

    if (cleanedContent === '') {
      await fs.remove(rulesPath);
    } else {
      await fs.writeFile(rulesPath, cleanedContent + '\n', 'utf8');
    }

    return ['.windsurfrules'];
  }

  private removeSauronBlock(content: string): string {
    const regex = /# SAURON START[\s\S]*?# SAURON END/g;
    return content.replace(regex, '').trim();
  }
}
