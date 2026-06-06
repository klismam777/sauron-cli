# Next.js - Arquitetura de Server Components e Roteamento

Este documento normatiza a organização lógica e padrões de Server vs Client Components no Next.js (App Router).

## 🎯 Regras Obrigatórias para a IA

1. **Server Components por Padrão**:
   - Todas as páginas (`page.tsx`) e layouts (`layout.tsx`) devem operar como Server Components por padrão.
   - Busque dados diretamente no servidor (usando `fetch` ou acessando o banco/serviço) em vez de chamar APIs internas via client.

2. **Client Components Isolados**:
   - Adicione a diretiva `'use client'` estritamente no topo de arquivos que necessitam de interatividade (hooks como `useState`, `useEffect` ou escutadores de eventos do DOM).
   - Mantenha os Client Components no menor nível possível na árvore de componentes (ex: encapsule um botão interativo em vez de tornar o cabeçalho inteiro client-side).

3. **Roteamento Dinâmico**:
   - Utilize a API `Link` nativa de `next/link` para navegação interna, garantindo pré-carregamento.
   - Utilize `useRouter` do `next/navigation` apenas em Client Components e navegações imperativas de evento.

## 🚫 Práticas Banidas
- Executar chamadas do Firebase Client SDK ou APIs internas diretamente em Server Components sem serialização apropriada.
- Utilização de hooks de estado fora de Client Components.
