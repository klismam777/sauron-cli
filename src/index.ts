#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'node:module';
import { runInitCommand } from './features/init/init.command.js';
import { runDoctorCommand } from './features/doctor/doctor.command.js';
import { runUninstallCommand } from './features/uninstall/uninstall.command.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { version?: string };
const program = new Command();

program
  .name('sauron')
  .description('Sauron CLI - Framework para resolução de Amnésia de Contexto em IAs')
  .version(pkg.version || '0.0.0');

program
  .command('init')
  .description('Inicializa o Sauron Memory System no projeto atual')
  .option('-y, --yes', 'Pula os prompts interativos e usa os valores padrão (Não-interativo)')
  .option('--json', 'Saída do resultado em formato JSON estruturado')
  .option('--conflict <resolution>', 'Estratégia de resolução de conflitos automática (ours | theirs)')
  .action((options) => runInitCommand(options));

program
  .command('doctor')
  .description('Executa uma auditoria de integridade e conformidade estrutural das regras e wiki')
  .option('--json', 'Saída do relatório em formato JSON estruturado')
  .action((options) => runDoctorCommand(options));

program
  .command('uninstall')
  .description('Remove as vinculações do Sauron CLI e regras de assistentes locais')
  .option('--purge', 'Remove fisicamente a pasta .sauron/ incluindo a wiki de documentação')
  .option('-y, --yes', 'Pula os prompts de confirmação de desinstalação')
  .option('--json', 'Saída do resultado em formato JSON estruturado')
  .action((options) => runUninstallCommand(options));

program.parse();
