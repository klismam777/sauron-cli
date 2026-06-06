import pc from 'picocolors';
import * as p from '@clack/prompts';
import { DoctorService } from './doctor.service.js';
import { SessionContext } from '../../domain/session/session-context.js';
import { PresentationRouter } from '../../presentation/router.js';

export interface DoctorCommandOptions {
  json?: boolean;
}

export async function runDoctorCommand(options: DoctorCommandOptions) {
  const cwd = process.cwd();

  const session = new SessionContext({
    json: !!options.json,
    interactive: !options.json,
  });

  const driver = PresentationRouter.createDriver(session);

  if (!session.json) {
    p.intro(pc.bgBlue(pc.white(' Sauron Memory System - Diagnóstico (Doctor) ')));
  }

  driver.startSpinner('Escaneando integridade do cérebro da IA...');

  const doctorService = new DoctorService();

  try {
    const report = await doctorService.execute(cwd);

    driver.stopSpinner('Auditoria concluída.', report.success);

    // Emissão detalhada no modo visual (Terminal)
    if (!session.json) {
      if (report.issues.length === 0) {
        driver.logSuccess('Nenhum problema encontrado. O Sauron está íntegro e em compliance!');
      } else {
        console.log('\nAnomalias Encontradas:');
        for (const issue of report.issues) {
          const badge =
            issue.severity === 'error'
              ? pc.red(pc.bold(' ERROR '))
              : pc.yellow(pc.bold(' WARNING '));
          
          console.log(`\n[${badge}] ${issue.message}`);
          if (issue.file) {
            console.log(`  Arquivo: ${pc.cyan(issue.file)}`);
          }
          if (issue.fix) {
            console.log(`  Correção recomendada: ${pc.green(issue.fix)}`);
          }
        }
        console.log('');
      }
    }

    const message = report.success
      ? 'Auditoria concluída com sucesso. Zero erros graves detectados!'
      : `Auditoria concluída com problemas. Foram encontrados ${report.issues.filter(i => i.severity === 'error').length} erros graves.`;

    driver.finish({
      success: report.success,
      message,
      payload: {
        cwd,
        success: report.success,
        issues: report.issues,
      },
    });
  } catch (error: any) {
    driver.stopSpinner('Erro na auditoria.', false);
    driver.finish({
      success: false,
      message: `Falha crítica durante a execução do doctor: ${error.message}`,
    });
  }
}
