export interface IMemoryPayload {
  projectName: string;
  globalRules: string;
  ruleScope?: string;
  fallbackReference?: string;
}

export interface IAgentAdapter {
  readonly id: string;
  readonly displayName: string;

  detect(targetDirectory: string): Promise<boolean>;
  inject(payload: IMemoryPayload, targetDirectory: string): Promise<string[]>;
  clean(targetDirectory: string): Promise<string[]>;
}
