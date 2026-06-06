#!/usr/bin/env node
import { Command } from 'commander';
import { runInitCommand } from './features/init/init.command.js';

const program = new Command();

program
  .name('sauron')
  .description('Sauron CLI - Framework para resolução de Amnésia de Contexto em IAs')
  .version('1.0.0');

program
  .command('init')
  .description('Inicializa o Sauron Memory System no projeto atual')
  .option('-y, --yes', 'Pula os prompts interativos e usa os valores padrão (Não-interativo)')
  .action((options) => runInitCommand(options));

program.parse();
