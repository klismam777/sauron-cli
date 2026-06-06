import { PresentationDriver } from '../../domain/adapters/presentation-driver.js';
import { SessionContext } from '../../domain/session/session-context.js';

interface LogEntry {
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
}

export class JsonDriver implements PresentationDriver {
  private logs: LogEntry[] = [];
  private payload: any = null;

  constructor(private context: SessionContext) {}

  logInfo(msg: string): void {
    this.addLog('info', msg);
  }

  logWarning(msg: string): void {
    this.addLog('warning', msg);
  }

  logSuccess(msg: string): void {
    this.addLog('success', msg);
  }

  logError(msg: string): void {
    this.addLog('error', msg);
  }

  startSpinner(msg: string): void {
    this.addLog('info', `Começou: ${msg}`);
  }

  stopSpinner(msg: string, success: boolean = true): void {
    this.addLog(success ? 'success' : 'error', `Terminou: ${msg}`);
  }

  async resolveConflict(
    filePath: string,
    localContent: string,
    newContent: string
  ): Promise<'ours' | 'theirs'> {
    this.addLog('warning', `Conflito detectado no arquivo: ${filePath}`);
    
    if (this.context.conflictResolution) {
      this.addLog(
        'info',
        `Conflito em ${filePath} resolvido automaticamente como '${this.context.conflictResolution}' via configuração de sessão.`
      );
      return this.context.conflictResolution;
    }

    this.addLog(
      'error',
      `Bloqueio de execução: Conflito detectado em ${filePath} em execução programática/não-interativa sem flag de resolução configurada (--conflict).`
    );
    
    this.finish({
      success: false,
      message: `Conflito não resolvido no arquivo ${filePath}. Defina --conflict para automatizar a resolução.`,
    });
    
    process.exit(1);
  }

  finish(data: { success: boolean; message?: string; payload?: any }): void {
    const output = {
      success: data.success,
      message: data.message || (data.success ? 'Operação concluída' : 'Operação falhou'),
      timestamp: new Date().toISOString(),
      logs: this.logs,
      payload: data.payload || this.payload,
    };

    console.log(JSON.stringify(output, null, 2));

    if (!data.success) {
      process.exit(1);
    }
  }

  private addLog(level: 'info' | 'warning' | 'error' | 'success', message: string): void {
    this.logs.push({
      level,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
