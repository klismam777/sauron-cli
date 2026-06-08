import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';
import { getManifest } from '../../core/manifest.service.js';
import { InitService } from './init.service.js';
import { SessionContext, ConflictResolution } from '../../domain/session/session-context.js';
import { PresentationRouter } from '../../presentation/router.js';
import { ProjectScanner } from '../../core/scanner/project-scanner.js';

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

  // 2. Instancia o Scanner e executa a varredura neural do projeto
  const scanner = new ProjectScanner(cwd);
  
  let scanSpinner: any = null;
  if (!session.json) {
    scanSpinner = p.spinner();
    scanSpinner.start('O Olho de Sauron está varrendo o repositório em busca da stack tecnológica e dependências...');
  }
  
  const scannedContext = await scanner.scan();
  
  // Pausa artificial (Labor Illusion) de 800ms se for interativo para satisfação de UI
  if (session.interactive) {
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
  
  if (scanSpinner) {
    scanSpinner.stop('Mapeamento neural concluído com sucesso. Contexto do repositório foi inferido.');
  }

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

  // Valores padrão e inferidos do scanner
  let aiTargets = scannedContext.detectedIAs;
  let severity = 'Observacional';
  let projectContext = 'Projeto Genérico';

  const inferredStackString = [
    scannedContext.primaryLanguage,
    ...scannedContext.frameworks,
    ...scannedContext.database,
    ...scannedContext.styling
  ].filter(Boolean).join(', ');
  
  let projectStack = inferredStackString || 'Node.js, TypeScript';

  // Extração de Estado e Bypass
  let bypassOnboarding = false;
  const manifestData = await getManifest(cwd);
  
  if (manifestData) {
    if (manifestData.config) {
      aiTargets = manifestData.config.aiTargets;
      severity = manifestData.config.severity;
      projectContext = manifestData.config.projectContext;
      projectStack = manifestData.config.projectStack;
    } else {
      // Compatibilidade reversa: tenta extrair do AGENTS.md
      const agentsMdPath = path.join(cwd, 'AGENTS.md');
      if (await fs.pathExists(agentsMdPath)) {
        const content = await fs.readFile(agentsMdPath, 'utf8');
        const targetsMatch = content.match(/\*\*Targets:\*\* (.*)/);
        if (targetsMatch) aiTargets = targetsMatch[1].split(',').map(s => s.trim());
        
        const severityMatch = content.match(/\*\*Severity:\*\* (.*)/);
        if (severityMatch) severity = severityMatch[1].trim();
        
        const contextMatch = content.match(/## Project Context\n([\s\S]*?)\n## Tech Stack/);
        if (contextMatch) projectContext = contextMatch[1].trim();
        
        const stackMatch = content.match(/## Tech Stack\n([\s\S]*?)\n## Golden Rule/);
        if (stackMatch) projectStack = stackMatch[1].trim();
      }
    }
    
    // Pergunta de bypass apenas se o ambiente for interativo
    if (session.interactive) {
       const bypass = await p.confirm({
         message: 'Detectamos uma instalação anterior. Deseja manter as configurações atuais e pular o onboarding?',
         initialValue: true
       });
       
       if (p.isCancel(bypass)) {
         p.cancel('Inicialização abortada.');
         process.exit(0);
       }
       
       bypassOnboarding = bypass as boolean;
    }
  }

  // Executa onboarding interativo de perguntas se permitido pela sessão
  if (session.interactive && !bypassOnboarding) {
    try {
      const config = await p.group(
        {
          targets: () =>
            p.multiselect({
              message: 'Confirmar a(s) IA(s) operativas que consumirão ativamente o contexto estruturado da Wiki:',
              options: [
                { value: 'Cursor', label: 'Cursor', hint: 'Recomendado' },
                { value: 'Windsurf', label: 'Windsurf' },
                { value: 'Aider', label: 'Aider' },
                { value: 'Antigravity', label: 'Antigravity', hint: 'Agente nativo' },
              ],
              initialValues: aiTargets,
              required: false,
            }),
          severity: () =>
            p.select({
              message: 'Defina a severidade rigorosa de implementação das regras contextuais da IA:',
              options: [
                { value: 'Observacional', label: 'Observacional (As regras servem apenas de sugestões orgânicas)' },
                { value: 'Estrito', label: 'Estrito (Enforcement ativo e recusa de lógicas em desacordo)' },
              ],
              initialValue: severity,
            }),
          context: () =>
            p.text({
              message: 'Descreva brevemente o contexto sistêmico do projeto (ou ratifique o contexto preditivo):',
              placeholder: 'Ex: App de agendamento de pilates',
              initialValue: projectContext,
            }),
          stack: () =>
            p.text({
              message: 'Qual a stack tecnológica mapeada em definitivo para este projeto?',
              placeholder: 'Ex: Next.js 15, Tailwind, Firebase',
              initialValue: projectStack,
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
        wikiTemplatesToInject: scannedContext.wikiTemplatesToInject,
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
