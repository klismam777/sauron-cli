# Plano de Implementação: Sauron CLI

Este é o plano detalhado de construção técnica do framework Sauron CLI. Ao iniciar um novo projeto, entregue este plano para o seu agente de IA para que ele possa executar a construção em 5 fases.

## Fase 1: Setup do Repositório
**Objetivo:** Inicializar o projeto Node.js e instalar o maquinário do CLI.

1. Inicialize um pacote Node.js (`npm init -y`).
2. Defina o campo `"bin": { "sauron": "./dist/index.js" }` e `"type": "module"` no `package.json`.
3. Instale as dependências essenciais: 
   - `npm install commander fs-extra picocolors`
   - `npm install -D typescript @types/node @types/fs-extra tsup`
4. Crie o arquivo `tsconfig.json` básico.
5. Crie um script no `package.json`: `"build": "tsup src/index.ts --format esm --clean"`.

## Fase 2: Construção dos Templates (O Coração)
**Objetivo:** Criar a pasta que armazena as réplicas exatas do sistema Sauron que serão ejetadas nas máquinas dos usuários.

Crie fisicamente a seguinte estrutura no diretório `templates/`:
```plaintext
templates/
├── .agents/
│   ├── rules/
│   │   └── memory.md       (Conteúdo que orienta a IA a ler o Sauron)
│   └── skills/
│       └── wiki/
│           └── SKILL.md    (Conteúdo da Write Obligation / Regra do Sauron)
└── .sauron/
    └── wiki/
        ├── summary.json    (Arquivo inicial de mapa vazio)
        ├── history/
        ├── knowledge/
        ├── manuals/
        ├── modules/
        └── standards/
```

## Fase 3: Desenvolvimento do Core CLI (`src/index.ts`)
**Objetivo:** Criar a porta de entrada que escuta o comando do usuário.

1. Crie a pasta `src/` e o arquivo `index.ts`.
2. Adicione a shebang line no topo de `index.ts`: `#!/usr/bin/env node`.
3. Configure o `commander` para iniciar o programa, declarando nome, versão e descrição.
4. Registre o comando primário: `program.command('init').description('Inicializa o Sauron Memory System no projeto atual').action(runInit)`.

## Fase 4: Lógica do Comando Init (`src/commands/init.ts`)
**Objetivo:** O motor que vai copiar os templates.

1. Identifique o diretório de execução do usuário usando `process.cwd()`.
2. Identifique onde os templates do CLI estão localizados localmente usando `__dirname` e caminhos relativos (cuidado com as diferenças de pathing no momento em que o código vira bundle pelo `tsup`).
3. Verifique com `fs-extra.pathExists` se `.sauron` ou `.agents` já existem no destino. Se sim, logue um aviso colorido com `picocolors` sugerindo cuidado ou pulando etapas não-destrutivas.
4. Execute `fs-extra.copy()` para ejetar `templates/.agents/` e `templates/.sauron/` para o `process.cwd()`.
5. Exiba mensagens visuais de sucesso indicando que a memória da IA está instalada.

## Fase 5: Build, Teste e Deploy
**Objetivo:** Empacotar e preparar para NPM.

1. Rode `npm run build`. O `tsup` deverá gerar a pasta `dist/` com o binário minificado.
2. Na raiz do projeto CLI, rode `npm link` para testar o binário globalmente no sistema local.
3. Crie uma pasta vazia aleatória e rode `sauron init` para atestar que os templates são injetados.
4. Adicione um arquivo `.npmignore` garantindo que os `templates/` e `dist/` não fiquem de fora da publicação (cuidado, `dist` costuma ficar no `.gitignore`).
5. (Final) Para a distribuição global, rode `npm login` seguido de `npm publish --access public`.
