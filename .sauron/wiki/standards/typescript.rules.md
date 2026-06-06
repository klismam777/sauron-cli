# TypeScript - Diretrizes de Qualidade e Tipagem Estrita

Este documento normatiza os padrões de tipagem e compilação para o uso do TypeScript no projeto.

## 🎯 Regras Obrigatórias para a IA

1. **Tipagem Estrita (Strict Mode)**:
   - Nunca utilizar `any` de forma deliberada. Se a tipagem for dinâmica ou desconhecida, prefira `unknown` e realize Type Guarding (assercões de tipo seguras).
   - Ative e respeite `noImplicitAny`, `strictNullChecks` e `noUnusedLocals`.

2. **Tipos vs Interfaces**:
   - Utilize `interface` para declarar contratos de objetos públicos, classes, e componentes expostos.
   - Utilize `type` para uniões (`|`), interseções (`&`), tuplas, tipos utilitários ou definições primitivas de alias.

3. **Importações Explicitas**:
   - Utilize imports com a extensão `.js` ao compilar para ECMAScript Modules (ESM) nativo no Node.js.
   - Prefira importações nomeadas em vez de imports coringa (`* as module`).

## 🚫 Práticas Banidas
- Desativar checagens com comentários `// @ts-ignore` (use `// @ts-expect-error` apenas com justificativa explícita e em testes).
- Asserções de tipo coercitivas (`as any` ou `as unknown as Type`).
