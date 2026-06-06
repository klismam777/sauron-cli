import pc from 'picocolors';
import * as p from '@clack/prompts';
import { UninstallService } from './uninstall.service.js';
import { SessionContext } from '../../domain/session/session-context.js';
import { PresentationRouter } from '../../presentation/router.js';

export interface UninstallCommandOptions {
  purge?: boolean;
  yes?: boolean;
  json?: boolean;
}

export async function runUninstallCommand(options: UninstallCommandOptions) {
  const cwd = process.cwd();

  const session = new SessionContext({
    json: !!options.json,
    interactive: !options.yes && !options.json,
  });

  const driver = PresentationRouter.createDriver(session);

  if (!session.json) {
    p.intro(pc.bgRed(pc.white(' Sauron Memory System - Desinstalação ')));
  }

  // Confirmação interativa se permitido
  if (session.interactive) {
    const confirm = await p.confirm({
      message: options.purge
        ? pc.red('Tem certeza que deseja desinstalar o Sauron e PURGAR toda a wiki de documentação física?')
        : 'Tem certeza que deseja desinstalar o Sauron deste projeto (a wiki/ de documentação será preservada)?',
    });

    if (p.isCancel(confirm) || !confirm) {
      p.cancel('Desinstalação abortada.');
      process.exit(0);
    }
  }

  driver.startSpinner('Desinstalando Sauron e limpando vinculações de agentes...');

  const uninstallService = new UninstallService();

  try {
    const removedPaths = await uninstallService.execute({
      cwd,
      purge: !!options.purge,
    });

    driver.stopSpinner('Desinstalação concluída.', true);

    const message = options.purge
      ? 'Sauron CLI desinstalado por completo e pasta wiki/ purgada com sucesso!'
      : 'Sauron CLI desinstalado com sucesso! A base wiki/ foi preservada como histórico de contexto.';

    driver.finish({
      success: true,
      message,
      payload: {
        cwd,
        purge: !!options.purge,
        removedPaths,
      },
    });
  } catch (error: any) {
    driver.stopSpinner('Erro ao desinstalar.', false);
    driver.finish({
      success: false,
      message: `Falha crítica durante a desinstalação: ${error.message}`,
    });
  }
}
