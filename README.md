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

## Comandos (MVP)

### `sauron init`

Inicializa o Sauron Memory System no projeto atual.
Ele executa um onboarding interativo que coleta as tecnologias do seu projeto para gerar um manifesto dinâmico (`AGENTS.md`). Em seguida, copia toda a estrutura base (`.sauron` e `.agents`) para o diretório raiz.

```bash
sauron init
```
*Nota: Graças ao nosso **Merge Engine** nativo, o comando é seguro para ser rodado várias vezes. Se houver alguma edição manual sua ou da sua IA nas regras, o Sauron detectará o conflito e abrirá uma interface interativa permitindo auditar o Diff e decidir se quer sobrescrever ou preservar suas regras.*

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
- `sauron check`: Comando de validação rigorosa para auditar a integridade da documentação deixada pela IA e bater o Markdown com o `summary.json`.
- `sauron map`: Visão em formato de árvore hierárquica direto no terminal do seu "Cérebro de IA".

---

**Sauron CLI** - Desenvolvido para a comunidade Indie Hacker e Tech Leads do futuro.
