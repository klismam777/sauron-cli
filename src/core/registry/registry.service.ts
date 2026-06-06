import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export interface RegistryWorkspace {
  name: string;
  rootPath: string;
  initializedAt: string;
  lastCheckedAt?: string;
  aiTargets: string[];
  severity: string;
}

export class RegistryService {
  private getRegistryPath(): string {
    const homeDir = os.homedir();
    return path.join(homeDir, '.sauron', 'registry.json');
  }

  public async registerWorkspace(
    name: string,
    rootPath: string,
    aiTargets: string[],
    severity: string
  ): Promise<void> {
    const registryPath = this.getRegistryPath();
    await fs.ensureDir(path.dirname(registryPath));

    let workspaces: RegistryWorkspace[] = [];

    if (await fs.pathExists(registryPath)) {
      try {
        workspaces = await fs.readJson(registryPath);
      } catch (err) {
        workspaces = [];
      }
    }

    const normalizedPath = path.resolve(rootPath).replace(/\\/g, '/');
    const existingIndex = workspaces.findIndex(
      (w) => path.resolve(w.rootPath).replace(/\\/g, '/') === normalizedPath
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      workspaces[existingIndex] = {
        ...workspaces[existingIndex],
        name,
        aiTargets,
        severity,
        lastCheckedAt: now,
      };
    } else {
      workspaces.push({
        name,
        rootPath: normalizedPath,
        initializedAt: now,
        lastCheckedAt: now,
        aiTargets,
        severity,
      });
    }

    await fs.writeJson(registryPath, workspaces, { spaces: 2 });
  }

  public async unregisterWorkspace(rootPath: string): Promise<void> {
    const registryPath = this.getRegistryPath();
    if (!(await fs.pathExists(registryPath))) {
      return;
    }

    let workspaces: RegistryWorkspace[] = [];
    try {
      workspaces = await fs.readJson(registryPath);
    } catch (err) {
      return;
    }

    const normalizedPath = path.resolve(rootPath).replace(/\\/g, '/');
    const filtered = workspaces.filter(
      (w) => path.resolve(w.rootPath).replace(/\\/g, '/') !== normalizedPath
    );

    await fs.writeJson(registryPath, filtered, { spaces: 2 });
  }

  public async listWorkspaces(): Promise<RegistryWorkspace[]> {
    const registryPath = this.getRegistryPath();
    if (!(await fs.pathExists(registryPath))) {
      return [];
    }

    try {
      return await fs.readJson(registryPath);
    } catch (err) {
      return [];
    }
  }
}
