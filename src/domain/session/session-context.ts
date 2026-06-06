export type ConflictResolution = 'ours' | 'theirs';

export interface SessionContextOptions {
  json: boolean;
  interactive: boolean;
  conflictResolution?: ConflictResolution;
  yes?: boolean;
}

export class SessionContext {
  public readonly json: boolean;
  public readonly interactive: boolean;
  public readonly conflictResolution?: ConflictResolution;
  public readonly yes: boolean;

  constructor(options: SessionContextOptions) {
    this.json = options.json;
    this.yes = options.yes || false;
    // O modo interativo é falso se --json estiver ativo ou se o usuário explicitou yes ou desativou interatividade.
    this.interactive = options.json ? false : (options.interactive ?? true);
    this.conflictResolution = options.conflictResolution;
  }
}
