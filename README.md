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
Ele copia passivamente toda a estrutura base (templates de instrução e JSON de mapa mental) para o diretório raiz do usuário.

```bash
sauron init
```
*Nota: Este comando é seguro e bloqueará automaticamente caso os diretórios `.sauron` ou `.agents` já existam no repositório, evitando a corrupção do seu histórico atual.*

## Estrutura Injetada

Ao rodar o comando `init`, a CLI injeta a seguinte topologia no projeto:

```text
/
├── .agents/
│   ├── rules/
│   └── skills/
└── .sauron/
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
