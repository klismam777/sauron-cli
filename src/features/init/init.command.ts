import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';
import { InitService } from './init.service.js';
import { SessionContext, ConflictResolution } from '../../domain/session/session-context.js';
import { PresentationRouter } from '../../presentation/router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface InitCommandOptions {
  yes?: boolean;
  json?: boolean;
  conflict?: ConflictResolution;
}

export async function runInitCommand(options: InitCommandOptions) {
  const cwd = process.cwd();

  // 1. Cria o contexto de sessão e o driver de apresentação correspondente
  const session = new SessionContext({
    json: !!options.json,
    interactive: !options.yes && !options.json,
    conflictResolution: options.conflict,
    yes: options.yes,
  });

  const driver = PresentationRouter.createDriver(session);

  // Exibe cabeçalho visual apenas se não for saída estruturada JSON
  if (!session.json) {
    const logo = `
\x1b[38;2;255;106;0m ██████  █████  ██    ██ ██████  ██████  ███    ██\x1b[0m
\x1b[38;2;255;179;0m██      ██   ██ ██    ██ ██   ██ ██   ██ ████   ██\x1b[0m
\x1b[38;2;255;215;0m╚█████╗ ███████ ██    ██ ██████  ██   ██ ██ ██  ██\x1b[0m
\x1b[38;2;255;140;0m     ██ ██   ██ ██    ██ ██   ██ ██   ██ ██  ██ ██
\x1b[38;2;204;51;0m██████  ██   ██  ██████  ██   ██ ██████  ██   ████\x1b[0m
`;
    console.log(pc.bold(logo));
    console.log(pc.dim('  CLI de Idempotência e Memória para IAs\n'));
    p.intro(pc.bgRed(pc.white(' Sauron Memory System - Inicialização ')));
  }

  // Valores padrão em modo não-interativo
  let aiTargets = ['Cursor', 'Windsurf', 'Aider', 'Antigravity'];
  let severity = 'Observacional';
  let projectContext = 'Projeto Genérico';
  let projectStack = 'Node.js, TypeScript';

  // Executa onboarding interativo de perguntas se permitido pela sessão
  if (session.interactive) {
    try {
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
    } catch (error: any) {
      driver.finish({ success: false, message: `Erro ao interagir com console: ${error.message}` });
      return;
    }
  }

  driver.startSpinner('Injetando o Cérebro da IA no repositório...');

  // Caminho resiliente para os templates
  let templatesDir = path.join(__dirname, '..', 'templates');
  if (!fs.existsSync(templatesDir)) {
    templatesDir = path.join(__dirname, '..', '..', '..', 'templates');
  }

  const initService = new InitService();

  try {
    const modifiedFiles = await initService.execute(
      {
        aiTargets,
        severity,
        projectContext,
        projectStack,
        cwd,
        templatesDir,
      },
      driver
    );

    driver.stopSpinner('Injeção finalizada.', true);

    const message = 
      'Sauron Memory System instalado com sucesso!\n\n' +
      'O Cérebro da IA foi injetado e protegido pelo motor de integridade.\n' +
      'Ações Recomendadas:\n' +
      'Copie o comando abaixo e envie para a sua IA testar a nova arquitetura:\n' +
      '"Analise a estrutura .sauron/ e .agents/ recém injetada e sugira quais regras críticas eu devo documentar agora para nosso projeto."';

    driver.finish({
      success: true,
      message,
      payload: {
        projectName: path.basename(cwd),
        cwd,
        aiTargets,
        severity,
        modifiedFiles,
      },
    });
  } catch (error: any) {
    driver.stopSpinner('Falha na instalação.', false);
    driver.finish({ success: false, message: error.message });
  }
}
