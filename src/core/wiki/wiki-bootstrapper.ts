import fs from 'fs-extra';
import path from 'path';
import { generateHash } from '../manifest.service.js';

interface WikiItem {
  type: 'file' | 'folder';
  name: string;
  slug: string;
  path: string;
  id: string;
  domainId?: string;
  orgId?: string;
  contentLength?: number;
  contentHash?: string;
}

export class WikiBootstrapper {
  private readonly standardsDir: string;
  private readonly wikiDir: string;

  constructor(private projectRoot: string) {
    this.wikiDir = path.join(projectRoot, '.sauron', 'wiki');
    this.standardsDir = path.join(this.wikiDir, 'standards');
  }

  public async bootstrapFromTemplates(
    templatesDir: string,
    wikiTemplatesToInject: string[]
  ): Promise<string[]> {
    const injectedFiles: string[] = [];
    const recipesSrcDir = path.join(templatesDir, 'wiki-recipes');

    if (!(await fs.pathExists(recipesSrcDir))) {
      return [];
    }

    await fs.ensureDir(this.standardsDir);

    const summaryPath = path.join(this.wikiDir, 'summary.json');
    let summary: WikiItem[] = [];
    if (await fs.pathExists(summaryPath)) {
      try {
        summary = await fs.readJson(summaryPath);
      } catch (err) {
        summary = [];
      }
    }

    for (const templateName of wikiTemplatesToInject) {
      const srcTemplatePath = path.join(recipesSrcDir, templateName);
      if (!(await fs.pathExists(srcTemplatePath))) {
        continue;
      }

      const destFilename = templateName; // ex: typescript.rules.md
      const destFullPath = path.join(this.standardsDir, destFilename);
      const relWikiPath = `standards/${destFilename}`;

      const content = await fs.readFile(srcTemplatePath, 'utf8');
      const hash = generateHash(content);
      const len = Buffer.byteLength(content, 'utf8');

      // 1. Grava no disco apenas se o arquivo ainda não existir (não-destrutivo)
      const exists = await fs.pathExists(destFullPath);
      if (!exists) {
        await fs.writeFile(destFullPath, content, 'utf8');
        injectedFiles.push(path.join('.sauron', 'wiki', relWikiPath).replace(/\\/g, '/'));
      }

      // 2. Registra ou atualiza no summary.json
      const slug = destFilename.replace('.rules.md', '').replace('.rules.txt', '');
      const docName = this.inferDocName(slug);
      const kbId = `kb-standards-${slug}`;

      const existingIndex = summary.findIndex((item) => item.path === relWikiPath);

      const newItem: WikiItem = {
        type: 'file',
        name: docName,
        slug: `${slug}-rules`,
        path: relWikiPath,
        id: kbId,
        domainId: 'domain-standards',
        orgId: 'org-sauron-cli',
        contentLength: len,
        contentHash: hash,
      };

      if (existingIndex >= 0) {
        // Atualiza apenas se não houver edição manual local prévia de hash no summary
        summary[existingIndex] = {
          ...summary[existingIndex],
          contentLength: len,
          contentHash: hash,
        };
      } else {
        summary.push(newItem);
      }
    }

    await fs.writeJson(summaryPath, summary, { spaces: 2 });

    return injectedFiles;
  }

  private inferDocName(slug: string): string {
    switch (slug.toLowerCase()) {
      case 'typescript':
        return 'TypeScript Guidelines';
      case 'nextjs':
        return 'Next.js App Router Rules';
      case 'react':
        return 'React Components & Hooks';
      case 'postgresql':
        return 'PostgreSQL SQL Standards';
      case 'tailwindcss':
        return 'Tailwind CSS Styles Manual';
      default:
        return `${slug.charAt(0).toUpperCase() + slug.slice(1)} Standards`;
    }
  }
}
