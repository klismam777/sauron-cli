import crypto from 'node:crypto';
import fs from 'fs-extra';
import path from 'node:path';

export interface Manifest {
  version: string;
  files: Record<string, string>;
  config?: {
    aiTargets: string[];
    severity: string;
    projectContext: string;
    projectStack: string;
  };
}

export function generateHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function getManifest(targetDir: string): Promise<Manifest | null> {
  const manifestPath = path.join(targetDir, '.sauron', '.manifest.json');
  if (await fs.pathExists(manifestPath)) {
    try {
      const content = await fs.readJson(manifestPath);
      return content as Manifest;
    } catch (err) {
      return null;
    }
  }
  return null;
}

export async function saveManifest(targetDir: string, manifest: Manifest): Promise<void> {
  const manifestPath = path.join(targetDir, '.sauron', '.manifest.json');
  await fs.ensureDir(path.dirname(manifestPath));
  await fs.writeJson(manifestPath, manifest, { spaces: 2 });
}
