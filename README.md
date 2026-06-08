# Sauron CLI 👁️

> O "Lobo Frontal" dos assistentes de código de IA. Resolva a amnésia de contexto de uma vez por todas.

O **Sauron CLI** é uma infraestrutura passiva de orquestração de contexto para IAs. Ele injeta um "Cérebro" estruturado nos seus repositórios, forçando as Inteligências Artificiais (como Cursor, Windsurf, Aider, Claude Code, Codex e Opencode) a respeitarem um conceito de **"Write Obligation" (Obrigação de Escrita)**. Em vez de apenas ler código, a IA passará a documentar decisões de negócio e arquitetura continuamente, garantindo que o seu projeto não quebre após meses sem ser tocado.

## O Problema

Assistentes de código são incrivelmente poderosos, mas sofrem de amnésia volátil. Entre o fechamento e a abertura de sessões da IDE, as IAs esquecem as regras do seu projeto, alucinam lógicas, e obrigam você a reescrever prompts diários para ditar o contexto. 

## A Solução

O Sauron resolve isso ejetando pastas estruturadas (`.sauron` e `.agents`) no seu repositório local. A partir desse momento, as IAs são condicionadas a documentar regras passivamente de acordo com os templates gerados, preservando o **Single Source of Truth** do seu produto.


## Instalação

Para inicializar o Sauron CLI no seu projeto, basta rodar o comando abaixo no terminal da raiz do seu projeto (não é necessário instalar nada globalmente):

```bash
npx sauron-cli init
```

## Comandos

### `sauron init`

Inicializa o Sauron Memory System no projeto atual de forma inteligente.
O comando executa uma **varredura heurística não-bloqueante** ($O(1)$) na raiz do repositório para detectar de forma autônoma a linguagem primária, frameworks, bancos de dados, gerenciadores de pacotes e ferramentas de IA ativas (Cursor, Windsurf, Aider, Antigravity, Claude Code, Codex, Opencode).

Durante o onboarding interativo, as perguntas são pré-populadas de forma inteligente com as informações detectadas. Ao concluir, o Sauron realiza a **injeção automática de receitas de Wiki** (Wiki Recipes) personalizadas para a sua stack tecnológica em `.sauron/wiki/standards/` (ex. TypeScript, Next.js, React, Tailwind CSS, PostgreSQL) de forma idempotente e não-destrutiva, gerando o manifesto dinâmico `AGENTS.md` e as regras de governança locais das IAs.

### Atualizações Inteligentes (Bypass & Reidratação)
O comando é totalmente **Idempotente**. Se executado em um repositório já inicializado:
- **Fast-Track (Bypass)**: O CLI detecta a configuração passada e oferece a opção de pular o onboarding, atualizando os agentes internos silenciosamente.
- **Reidratação Interativa**: Caso você queira alterar a configuração, os formulários do terminal são reidratados com o seu último estado configurado, poupando a necessidade de redigitar contextos complexos.
- **Wiki Protection**: Um filtro cirúrgico é ativado no motor de cópia da CLI, tornando a sua Base de Conhecimento em `.sauron/wiki/` 100% blindada contra *overwrites* acidentais durante a atualização.

### Como Atualizar um Projeto Existente
Para trazer as regras e inteligências mais recentes para o seu repositório sem perder o seu contexto salvo, basta rodar o `init` forçando a versão `@latest` do NPM:

```bash
npx sauron-cli@latest init
```

### Comandos da CLI

```bash
# Inicialização interativa padrão
sauron init

# Inicialização silenciosa/não-interativa programática
sauron init -y --conflict ours

# Saída estruturada em formato JSON
sauron init -y --json
```
*Nota: Graças ao nosso **Merge Engine** nativo, o comando é seguro para ser rodado várias vezes. Em ambientes programáticos (como scripts ou bots), use `--conflict ours|theirs` para tomada de decisão automática de merges.*

### `sauron doctor`

Executa uma auditoria completa de integridade e conformidade estrutural e criptográfica (SHA-256) das regras, sumário da wiki e adaptadores de IAs configurados no projeto.

```bash
# Diagnóstico visual interativo
sauron doctor

# Diagnóstico com saída estruturada JSON (útil em pipelines de CI/CD)
sauron doctor --json
```

### `sauron uninstall`

Desvincula as preferências do Sauron no repositório local e central. Realiza a higiene cirúrgica das IDEs (removendo vinculações e regras específicas).
*Nota: A wiki de documentação em `.sauron/wiki/` é preservada por padrão (degradação graciosa). Para removê-la fisicamente por completo, utilize a flag `--purge`.*

```bash
# Desinstalação com preservação da wiki
sauron uninstall

# Desinstalação profunda com purga física completa
sauron uninstall -y --purge
```

## Estrutura Injetada

Ao rodar o comando `init`, a CLI injeta a seguinte topologia no projeto:

```text
/
├── AGENTS.md
├── .agents/
│   ├── rules/
│   └── skills/
└── .sauron/
    ├── .manifest.json
    └── wiki/
        ├── summary.json
        ├── history/
        ├── knowledge/
        ├── manuals/
        ├── modules/
        └── standards/
```

## Stack Tecnológica
- **Node.js**: Engine nativa.
- **TypeScript**: Tipagem estática e segurança.
- **Commander.js**: Para interfaceamento e rotas CLI.
- **Tsup**: Bundler rápido para Node e ESM.
- **fs-extra**: Gerenciamento avançado de arquivos.

## Desenvolvimento

Para contribuir com o core do CLI:

```bash
# 1. Instale as dependências
npm install

# 2. Rode o build local
npm run build

# 3. Vincule a CLI globalmente para testes
npm link
```

## Próximos Passos no Roadmap
- `sauron map`: Visão em formato de árvore hierárquica direto no terminal do seu "Cérebro de IA".

---

**Sauron CLI** - Desenvolvido para a comunidade Indie Hacker e Tech Leads do futuro.
