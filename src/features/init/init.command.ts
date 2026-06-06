import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';
import * as Diff from 'diff';
import { InitService } from './init.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runInitCommand(options: { yes?: boolean }) {
  const cwd = process.cwd();
  
  const logo = `
\x1b[38;2;255;106;0m ██████  █████  ██    ██ ██████  ██████  ███    ██\x1b[0m
\x1b[38;2;255;179;0m██      ██   ██ ██    ██ ██   ██ ██   ██ ████   ██\x1b[0m
\x1b[38;2;255;215;0m╚█████╗ ███████ ██    ██ ██████  ██   ██ ██ ██  ██\x1b[0m
\x1b[38;2;255;140;0m     ██ ██   ██ ██    ██ ██   ██ ██   ██ ██  ██ ██\x1b[0m
\x1b[38;2;204;51;0m██████  ██   ██  ██████  ██   ██ ██████  ██   ████\x1b[0m
`;

  console.log(pc.bold(logo));
  console.log(pc.dim('  CLI de Idempotência e Memória para IAs\n'));

  p.intro(pc.bgRed(pc.white(' Sauron Memory System - Inicialização ')));

  let aiTargets = ['Cursor', 'Windsurf', 'Aider', 'Antigravity'];
  let severity = 'Observacional';
  let projectContext = 'Projeto Genérico';
  let projectStack = 'Node.js, TypeScript';

  if (!options.yes) {
    const config = await p.group(
      {
        targets: () =>
          p.multiselect({
            message: 'Qual(is) IA(s) você usará neste projeto?',
            options: [
              { value: 'Cursor', label: 'Cursor', hint: 'Recomendado' },
              { value: 'Windsurf', label: 'Windsurf' },
              { value: 'Aider', label: 'Aider' },
              { value: 'Antigravity', label: 'Antigravity', hint: 'Agente nativo' },
            ],
            required: false,
          }),
        severity: () =>
          p.select({
            message: 'Qual o nível de severidade das regras da IA?',
            options: [
              { value: 'Observacional', label: 'Observacional (A IA documenta quando julgar necessário)' },
              { value: 'Estrito', label: 'Estrito (Bloqueia alterações sem documentação explícita)' },
            ],
          }),
        context: () =>
          p.text({
            message: 'Descreva brevemente o contexto do seu projeto:',
            placeholder: 'Ex: App de agendamento de pilates',
            defaultValue: 'Projeto Genérico',
          }),
        stack: () =>
          p.text({
            message: 'Qual a stack tecnológica principal do seu projeto?',
            placeholder: 'Ex: Next.js 15, Tailwind, Firebase',
            defaultValue: 'Node.js, TypeScript',
          }),
      },
      {
        onCancel: () => {
          p.cancel('Inicialização abortada.');
          process.exit(0);
        },
      }
    );

    aiTargets = config.targets as string[];
    severity = config.severity as string;
    projectContext = config.context as string;
    projectStack = config.stack as string;
  }

  const s = p.spinner();
  s.start('Injetando o Cérebro da IA no repositório...');

  // Resolve o caminho de templates de forma resiliente em desenvolvimento e em build (tsup)
  let templatesDir = path.join(__dirname, '..', 'templates');
  if (!fs.existsSync(templatesDir)) {
    templatesDir = path.join(__dirname, '..', '..', '..', 'templates');
  }

  const initService = new InitService();

  try {
    await initService.execute(
      {
        aiTargets,
        severity,
        projectContext,
        projectStack,
        cwd,
        templatesDir,
      },
      async (filePath, localContent, newContent) => {
        s.stop(`Conflito em ${filePath}`);
        const decision = await showConflictUI(filePath, localContent, newContent);
        s.start('Continuando injeção...');
        return decision;
      }
    );

    s.stop('Injeção finalizada.');

    p.outro(
      pc.green(pc.bold('Sauron Memory System instalado com sucesso!\n\n')) +
      pc.white('O Cérebro da IA foi injetado e protegido pelo motor de integridade.\n') +
      pc.cyan('Ações Recomendadas:\n') +
      pc.dim('Copie o comando abaixo e envie para a sua IA testar a nova arquitetura:\n') +
      pc.yellow('"Analise a estrutura .sauron/ e .agents/ recém injetada e sugira quais regras críticas eu devo documentar agora para nosso projeto."')
    );
  } catch (error: any) {
    s.stop('Falha na instalação.');
    p.cancel(error.message);
    process.exit(1);
  }
}

async function showConflictUI(filePath: string, localContent: string, newContent: string): Promise<'ours' | 'theirs'> {
  p.note(`Foi detectada uma mutação no arquivo: ${pc.cyan(filePath)}\nO seu agente de IA ou você modificou este arquivo desde a última instalação.`, '⚠️  CONFLITO DETECTADO');

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
      const diffStr = renderDiff(localContent, newContent, filePath);
      console.log('\n' + diffStr + '\n');
    } else {
      resolved = action as 'ours' | 'theirs';
    }
  }

  return resolved;
}

function renderDiff(oldStr: string, newStr: string, fileName: string): string {
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
