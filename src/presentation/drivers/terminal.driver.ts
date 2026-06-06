import * as p from '@clack/prompts';
import pc from 'picocolors';
import * as Diff from 'diff';
import { PresentationDriver } from '../../domain/adapters/presentation-driver.js';
import { SessionContext } from '../../domain/session/session-context.js';

export class TerminalDriver implements PresentationDriver {
  private spinnerInstance = p.spinner();

  constructor(private context: SessionContext) {}

  logInfo(msg: string): void {
    console.log(pc.blue('ℹ ') + pc.white(msg));
  }

  logWarning(msg: string): void {
    console.log(pc.yellow('⚠️ ') + pc.yellow(msg));
  }

  logSuccess(msg: string): void {
    console.log(pc.green('✔ ') + pc.green(msg));
  }

  logError(msg: string): void {
    console.log(pc.red('✖ ') + pc.red(msg));
  }

  startSpinner(msg: string): void {
    this.spinnerInstance.start(msg);
  }

  stopSpinner(msg: string, success: boolean = true): void {
    if (success) {
      this.spinnerInstance.stop(pc.green('✔ ') + msg);
    } else {
      this.spinnerInstance.stop(pc.red('✖ ') + msg);
    }
  }

  async resolveConflict(
    filePath: string,
    localContent: string,
    newContent: string
  ): Promise<'ours' | 'theirs'> {
    this.stopSpinner(`Conflito em ${filePath}`, false);

    // Se a sessão for não-interativa, resolve automaticamente ou falha controladamente
    if (!this.context.interactive) {
      if (this.context.conflictResolution) {
        this.logInfo(
          `Conflito em ${filePath} resolvido automaticamente como '${this.context.conflictResolution}' em execução não-interativa.`
        );
        this.startSpinner('Continuando processamento...');
        return this.context.conflictResolution;
      }

      this.logError(
        `Conflito detectado em ${filePath} em execução não-interativa sem flag de resolução configurada (--conflict).`
      );
      this.finish({
        success: false,
        message: `Conflito não resolvido no arquivo ${filePath}. Defina --conflict para automatizar a resolução.`,
      });
      process.exit(1);
    }
    
    p.note(
      `Foi detectada uma mutação no arquivo: ${pc.cyan(filePath)}\nO seu agente de IA ou você modificou este arquivo desde a última instalação.`,
      '⚠️  CONFLITO DETECTADO'
    );

    let resolved: 'ours' | 'theirs' | null = null;

    while (!resolved) {
      const action = await p.select({
        message: `Como deseja proceder com ${pc.cyan(filePath)}?`,
        options: [
          { value: 'ours', label: 'Preservar Local (Ours)', hint: 'Mantém sua versão e ignora o novo template' },
          { value: 'theirs', label: 'Sobrescrever (Theirs)', hint: 'Destrói a sua versão e aplica o template novo' },
          { value: 'diff', label: 'Auditar Diferenças (Diff Mode)', hint: 'Mostra o que vai mudar visualmente' },
        ],
      });

      if (p.isCancel(action)) {
        p.cancel('Operação cancelada pelo usuário durante a resolução de conflito.');
        process.exit(0);
      }

      if (action === 'diff') {
        const diffStr = this.renderDiff(localContent, newContent, filePath);
        console.log('\n' + diffStr + '\n');
      } else {
        resolved = action as 'ours' | 'theirs';
      }
    }

    this.startSpinner('Continuando processamento...');
    return resolved;
  }

  finish(data: { success: boolean; message?: string; payload?: any }): void {
    if (data.success) {
      p.outro(pc.green(pc.bold(data.message || 'Operação finalizada com sucesso!')));
    } else {
      p.cancel(pc.red(pc.bold(data.message || 'Operação falhou.')));
      process.exit(1);
    }
  }

  private renderDiff(oldStr: string, newStr: string, fileName: string): string {
    const diffs = Diff.diffLines(oldStr, newStr);
    let output = pc.bold(`--- a/${fileName} (Local)\n+++ b/${fileName} (Novo Template)\n`);

    diffs.forEach((part) => {
      const lines = part.value.replace(/\n$/, '').split('\n');
      for (const line of lines) {
        if (part.added) {
          output += pc.green(`+ ${line}\n`);
        } else if (part.removed) {
          output += pc.red(`- ${line}\n`);
        } else {
          output += pc.dim(`  ${line}\n`);
        }
      }
    });

    return output;
  }
}
