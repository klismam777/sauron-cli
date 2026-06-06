#!/usr/bin/env node
import { Command } from 'commander';
import { runInit } from './commands/init.js';

const program = new Command();

program
  .name('sauron')
  .description('Sauron CLI - Framework para resolução de Amnésia de Contexto em IAs')
  .version('1.0.0');

program
  .command('init')
  .description('Inicializa o Sauron Memory System no projeto atual')
  .action(runInit);

program.parse();
