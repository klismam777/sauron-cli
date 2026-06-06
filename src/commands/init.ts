import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runInit() {
  const cwd = process.cwd();
  
  // Como o tsup gera o bundle em dist/index.js,
  // a pasta templates estará em ../templates a partir do dist/
  const packageRoot = path.join(__dirname, '..'); 
  const templatesDir = path.join(packageRoot, 'templates');
  
  const targetSauronDir = path.join(cwd, '.sauron');
  const targetAgentsDir = path.join(cwd, '.agents');

  console.log(pc.blue('Inicializando Sauron Memory System...'));

  if (await fs.pathExists(targetSauronDir) || await fs.pathExists(targetAgentsDir)) {
    console.error(pc.red('Erro: Sauron já inicializado neste diretório (pasta .sauron ou .agents existente).'));
    process.exit(1);
  }

  try {
    const sourceSauronDir = path.join(templatesDir, '.sauron');
    const sourceAgentsDir = path.join(templatesDir, '.agents');

    if (await fs.pathExists(sourceAgentsDir)) {
      await fs.copy(sourceAgentsDir, targetAgentsDir);
    } else {
      console.warn(pc.yellow(`Aviso: Pasta .agents não encontrada nos templates originais (${sourceAgentsDir}).`));
    }

    if (await fs.pathExists(sourceSauronDir)) {
      await fs.copy(sourceSauronDir, targetSauronDir);
    } else {
      console.warn(pc.yellow(`Aviso: Pasta .sauron não encontrada nos templates originais (${sourceSauronDir}).`));
    }

    console.log(pc.green(pc.bold('\nSauron Memory System instalado com sucesso! 👁️\n')));
    console.log(pc.white('O Cérebro da IA foi ejetado neste diretório. A partir de agora, suas IAs documentarão regras passivamente.\n'));
  } catch (error) {
    console.error(pc.red('Erro fatal ao ejetar os arquivos do Sauron:'), error);
    process.exit(1);
  }
}
