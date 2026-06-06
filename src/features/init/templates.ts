export function generateAgentsMarkdown(
  aiTargets: string[],
  severity: string,
  projectContext: string,
  projectStack: string
): string {
  return `# Diretrizes Globais de Agentes (Sauron CLI)

**Alvos:** ${aiTargets.join(', ')}
**Severidade:** ${severity}

## Contexto do Projeto
${projectContext}

## Stack Tecnológica
${projectStack}

## Regra de Ouro (Write Obligation)
Todos os agentes operando neste repositório estão estritamente obrigados a documentar qualquer alteração arquitetural, de regra de negócio ou mutação de estado nas pastas \`.sauron\` e \`.agents\` correspondentes. A leitura passiva sem documentação é considerada quebra de compliance.

*Gerado automaticamente pelo Sauron CLI.*
`;
}
