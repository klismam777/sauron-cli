# Sauron CLI 👁️

> O "Lobo Frontal" dos assistentes de código de IA. Resolva a amnésia de contexto de uma vez por todas.

O **Sauron CLI** é uma infraestrutura passiva de orquestração de contexto para IAs. Ele injeta um "Cérebro" estruturado nos seus repositórios, forçando as Inteligências Artificiais (como Cursor, Windsurf e Aider) a respeitarem um conceito de **"Write Obligation" (Obrigação de Escrita)**. Em vez de apenas ler código, a IA passará a documentar decisões de negócio e arquitetura continuamente, garantindo que o seu projeto não quebre após meses sem ser tocado.

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

Inicializa o Sauron Memory System no projeto atual.
Ele executa um onboarding interativo que coleta as tecnologias do seu projeto para gerar um manifesto dinâmico (`AGENTS.md`) e injeta as regras específicas de acordo com os adaptadores de IAs configurados (Cursor AI `.mdc`, Windsurf Cascade `.windsurfrules`, Aider `.aider.instructions.md`, Antigravity).

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
