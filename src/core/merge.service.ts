import { generateHash } from './manifest.service.js';

export function checkConflict(
  localContent: string,
  newContent: string,
  manifestHash: string | undefined
): boolean {
  const localHash = generateHash(localContent);

  // Se o conteúdo local for exatamente o mesmo do template original (não sofreu mutação),
  // ou se não houver hash no manifesto (é a primeira vez mas o arquivo já existia de alguma forma),
  // e o conteúdo é diferente do novo, podemos perguntar ou sobrescrever.
  // Pelo design, se for exatamente o do manifesto, nós sobrescrevemos silenciosamente.
  if (manifestHash && localHash === manifestHash) {
    return false; // Não há conflito, atualização silenciosa permitida.
  }

  // Se o local já é idêntico ao novo template, não há conflito.
  if (localContent === newContent) {
    return false;
  }

  // Há conflito (mutação orgânica detectada e difere do novo template)
  return true;
}
