# React - Gestão de Estado e Ciclo de Vida

Este documento estabelece as diretrizes para a manipulação de componentes e renderização no React.

## 🎯 Regras Obrigatórias para a IA

1. **Componentes Funcionais Estritos**:
   - Utilize exclusivamente componentes funcionais baseados em Arrow Functions ou declarações de função TypeScript. Componentes baseados em classe estão terminantemente proibidos.

2. **Custom Hooks para Lógica**:
   - Separe a lógica de negócio do componente visual. Se um componente possui lógica de fetching, paginação ou hooks complexos, isole-os em um custom hook (`useMyFeature.ts`).

3. **Performance e Re-render**:
   - Utilize `useMemo` e `useCallback` estritamente para evitar recomputações pesadas ou manter referências de objetos estáveis passados como dependência em hooks. Evite micro-otimizações desnecessárias.

## 🚫 Práticas Banidas
- Mutação direta de estados (ex: `state.push(item)`). Sempre utilize a função de mutação do `useState` aplicando imutabilidade (`setRawState([...state, item])`).
- Injeção de lógica pesada de controle diretamente dentro do retorno visual JSX.
