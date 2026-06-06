# Resiliência no Caminho de Templates (Correção de Bug e Onboarding)

## O que foi feito
- Análise de viabilidade e onboarding detalhado da arquitetura da Sauron CLI.
- Correção de um bug na resolução do diretório de templates (`templatesDir`) em `src/features/init/init.command.ts`.
- Inicialização do Sauron Memory System no próprio projeto `sauron-cli`.

## Por que foi feito
Anteriormente, o comando `sauron init` assumia que o arquivo compilado estaria no mesmo nível relativo de diretórios do ambiente de desenvolvimento (dentro de `dist/features/init/init.command.js`). No entanto, o empacotamento com o `tsup` condensa toda a saída em um único bundle em `dist/index.js`, fazendo com que `__dirname` em tempo de execução aponte diretamente para `dist/`. Isso causava um retorno silencioso no processo de cópia de templates, deixando a pasta `.agents` e a wiki em `.sauron` inexistentes no diretório de destino do usuário.

## Como funciona
A localização do diretório `templates` foi reformulada para ser resiliente e buscar em múltiplos níveis de diretório relativos a `__dirname`:
1. Verifica se `templates` existe um nível acima de `__dirname` (padrão de build em `dist/index.js`).
2. Se não existir, retrocede três níveis (padrão em ambiente de desenvolvimento rodando a partir de `src/features/init/init.command.ts`).

```typescript
// src/features/init/init.command.ts
let templatesDir = path.join(__dirname, '..', 'templates');
if (!fs.existsSync(templatesDir)) {
  templatesDir = path.join(__dirname, '..', '..', '..', 'templates');
}
```

## Arquivos afetados
- [init.command.ts](file:///F:/Projetos/sauron-cli/src/features/init/init.command.ts)
- [dist/index.js](file:///F:/Projetos/sauron-cli/dist/index.js) (Regerado pós-build)

## Data
2026-06-06T19:40:00-03:00
