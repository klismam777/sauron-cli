# Reestruturação Arquitetural do Core: De Monolito a Framework Desacoplado

## O que foi feito
- Implementação de um fluxo de controle de E/S e visualização desacoplado utilizando o padrão de projeto Strategy.
- Criação dos novos comandos de ciclo de vida do Sauron CLI:
  - `sauron doctor`: Inspeciona a integridade criptográfica SHA-256 e de conformidade do projeto.
  - `sauron uninstall`: Desvincula as configurações do Sauron, com remoção cirúrgica de regras injetadas e degradação graciosa da wiki (preservada por padrão).
- Implementação de um Registro Global Central (`~/.sauron/registry.json`) para rastreabilidade de múltiplos projetos sob a jurisdição do Sauron.
- Desenvolvimento de adaptadores específicos de IAs (`CursorAdapter`, `WindsurfAdapter`, `AiderAdapter`, `AntigravityAdapter`) para injeção e higiene nativas dos arquivos das IDEs (.mdc, .windsurfrules, etc.).
- Suporte nativo a modos programáticos (`--json`, `--no-interactive`) em todos os comandos, evitando travamentos em pipelines.

## Por que foi feito
A versão anterior possuía um acoplamento rígido de entrada e saída com a lógica central de injeção, impedindo a sua automação por agentes autônomos ou processos de CI/CD (pois os prompts interativos causavam travamentos perpétuos se conflitos surgissem). Além disso, a injeção estática e agnóstica não atendia aos formatos de configuração específicos de cada IDE/IA moderna.

## Como funciona
1. **Contexto de Sessão e PresentationDriver**: O roteador decide qual driver (Terminal ou JSON) instanciar baseado nas flags globais da CLI. Se o modo for não-interativo e surgir um conflito de arquivos, o driver resolve o conflito com a estratégia fornecida via `--conflict <ours|theirs>` ou gera um erro imediato.
2. **Padrão Adaptador**: Cada IA alvo possui um adaptador concreto. Para o Cursor, injeta regras em `.cursor/rules/sauron-memory.mdc` com frontmatter YAML. Para o Windsurf, manipula cirurgicamente o arquivo compartilhado `.windsurfrules` isolando o bloco do Sauron com marcadores de âncora `# SAURON START` e `# SAURON END`, removidos no `uninstall`.
3. **Registry Central**: Armazena metadados essenciais de todos os projetos na máquina local.

## Arquivos afetados
- Praticamente todo o código da CLI foi modularizado sob os novos diretórios:
  - [src/domain/](file:///F:/Projetos/sauron-cli/src/domain/) (entidades de sessão e interfaces de adaptador)
  - [src/presentation/](file:///F:/Projetos/sauron-cli/src/presentation/) (drivers concretos e roteamento)
  - [src/core/](file:///F:/Projetos/sauron-cli/src/core/) (registry global e adaptadores de agentes)
  - [src/features/](file:///F:/Projetos/sauron-cli/src/features/) (handlers dos comandos init, doctor e uninstall)
- [src/index.ts](file:///F:/Projetos/sauron-cli/src/index.ts) (registro dos comandos commander)

## Data
2026-06-06T20:20:00-03:00
