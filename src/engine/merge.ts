import * as p from '@clack/prompts';
import pc from 'picocolors';
import fs from 'fs-extra';
import { generateHash } from './manifest.js';
import * as Diff from 'diff';

export async function resolveConflict(
  filePath: string,
  localContent: string,
  newContent: string,
  manifestHash: string | undefined
): Promise<'ours' | 'theirs'> {
  const localHash = generateHash(localContent);

  // Se o conteúdo local for exatamente o mesmo do template original (não sofreu mutação),
  // ou se não houver hash no manifesto (é a primeira vez mas o arquivo já existia de alguma forma),
  // e o conteúdo é diferente do novo, podemos perguntar ou sobrescrever.
  // Pelo design, se for exatamente o do manifesto, nós sobrescrevemos silenciosamente.
  if (manifestHash && localHash === manifestHash) {
    return 'theirs'; // Atualização silenciosa permitida.
  }

  // Se o local já é idêntico ao novo template, nada a fazer.
  if (localContent === newContent) {
    return 'ours';
  }

  // Houve mutação local. Vamos abrir a interface de resolução.
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
