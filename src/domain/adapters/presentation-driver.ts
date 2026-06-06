export interface PresentationDriver {
  logInfo(msg: string): void;
  logWarning(msg: string): void;
  logSuccess(msg: string): void;
  logError(msg: string): void;
  
  startSpinner(msg: string): void;
  stopSpinner(msg: string, success?: boolean): void;
  
  resolveConflict(
    filePath: string,
    localContent: string,
    newContent: string
  ): Promise<'ours' | 'theirs'>;
  
  finish(data: { success: boolean; message?: string; payload?: any }): void;
}
