# Implementação do Scanner Inteligente de Projetos e Receitas de Wiki

## O que foi feito
- **Scanner Heurístico Superficial (`ProjectScanner`)**: Varredura assíncrona não bloqueante de nível superior na raiz do repositório (O(1)) filtrando cirurgicamente pastas gigantes (`node_modules`, `.git`) para extrair a stack de desenvolvimento, bancos de dados, IAs configuradas (Cursor, Windsurf, Aider, Antigravity) e gerenciadores de pacotes.
- **Dicionário de Assinaturas Tecnológicas (`signatures.ts`)**: Mapeamento estruturado de tecnologias como TypeScript, Next.js, React, NestJS, Express, Prisma, PostgreSQL e Redis com base em dependências declaradas e arquivos marcadores físicos (ex. `compose.yml`).
- **Geração Condicional de Documentação (`WikiBootstrapper`)**: Injeção automática e não destrutiva de guias e regras de estilo baseadas em prompts de IA para cada tecnologia identificada, armazenados na pasta de templates `templates/wiki-recipes/`.
- **Governança Dinâmica da Wiki (`summary.json`)**: Registro automático das receitas injetadas com geração idempotente de UUIDs de KB, slugs, cálculo de tamanho em bytes (`contentLength`) e hash SHA-256 (`contentHash`).
- **Polimento UX e Labor Illusion**: Delay artificial de 800ms em execução interativa que informa visualmente a varredura e pré-popula de forma inteligente os inputs de onboarding do `@clack/prompts`.
- **Proteção a Arquivos Mutáveis**: Correção na governança do `.manifest.json` da CLI para excluir arquivos de evolução contínua (`.sauron/wiki/summary.json` e `.agents/rules/memory.md`), garantindo que o comando `sauron doctor` não reporte falsos alertas de modificação manual.

## Por que foi feito
O onboarding inicial dependia de digitação manual cega por parte do desenvolvedor, gerando fricção. Além disso, a estrutura de wiki anterior injetava apenas estruturas vazias sem o know-how de desenvolvimento das ferramentas específicas do repositório, deixando o "Cérebro da IA" sem contexto especializado de melhores práticas sobre as tecnologias de eleição.

## Como funciona
1. **Varredura**: O `ProjectScanner` usa `fs.readdir` com `withFileTypes: true` para identificar arquivos marcadores (como `tsconfig.json`) e lê o `package.json` para testar assinaturas. Também analisa docker compose em busca de imagens de banco de dados.
2. **Onboarding**: No modo interativo, o spinner exibe a análise por 800ms, em seguida alimenta os inputs interativos usando as propriedades `initialValue`/`initialValues`.
3. **Injeção de Receitas**: O `WikiBootstrapper` copia as receitas de `templates/wiki-recipes/` aplicáveis para `.sauron/wiki/standards/` se o arquivo destino não existir, registrando a entrada correspondente no `summary.json`.
4. **Higiene do Doctor**: A CLI não inclui mais arquivos sob `.sauron/wiki/` ou `.agents/rules/memory.md` no `.manifest.json` para que edições orgânicas da equipe de desenvolvimento transcorram sem acionar alarmes de violação de integridade.

## Arquivos afetados
- [src/core/scanner/signatures.ts](file:///F:/Projetos/sauron-cli/src/core/scanner/signatures.ts)
- [src/core/scanner/project-scanner.ts](file:///F:/Projetos/sauron-cli/src/core/scanner/project-scanner.ts)
- [src/core/wiki/wiki-bootstrapper.ts](file:///F:/Projetos/sauron-cli/src/core/wiki/wiki-bootstrapper.ts)
- [src/features/init/init.command.ts](file:///F:/Projetos/sauron-cli/src/features/init/init.command.ts)
- [src/features/init/init.service.ts](file:///F:/Projetos/sauron-cli/src/features/init/init.service.ts)
- [templates/wiki-recipes/](file:///F:/Projetos/sauron-cli/templates/wiki-recipes/) (diretório de regras Markdown)

## Data
2026-06-06T20:56:00-03:00
