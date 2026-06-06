# Prompt: Design do Onboarding e Instalação do Sauron CLI

```text
Estou desenvolvendo o Sauron CLI, uma infraestrutura passiva de orquestração de contexto para IAs (como Cursor, Windsurf, Aider e Antigravity). A ferramenta resolve o problema da "Amnésia de Contexto" ejetando pastas estruturadas (.sauron e .agents) nos repositórios locais. Isso força os agentes de IA a respeitarem o conceito de "Write Obligation", documentando regras de negócio e decisões de arquitetura continuamente, em vez de apenas ler o código.

Stack atual: Node.js (>= 18), TypeScript, Commander.js, fs-extra, picocolors e tsup. O projeto está sendo construído inteiramente em pair-programming com o agente Antigravity.

Nesta Fase (MVP), eu já possuo o comando básico `npx sauron-cli init` funcionando. Ele simplesmente copia os templates base para a raiz do repositório, mas falha intencionalmente se as pastas já existirem para proteger os dados.

O objetivo agora é evoluir e projetar a experiência ideal de onboarding e instalação desse framework. Como esse fluxo de governança de agentes é um "mundo novo" para mim e para os usuários, quero uma instalação que passe uma sensação muito completa e inspiradora, nos moldes de ferramentas robustas como o `openspec`.

Preciso que você me forneça um design de experiência focado na CLI que responda claramente aos seguintes pontos:

1. O comando `init` deve instalar tudo de vez e de forma silenciosa, ou deve ser interativo (com prompts no terminal perguntando o contexto do projeto, nível de severidade de regras, etc.)? Justifique qual a melhor abordagem para a adoção inicial.
2. Como devemos lidar com usuários que já têm o Sauron instalado e desejam rodar o `init` novamente para atualizar os templates da wiki sem destruir as regras que suas IAs já escreveram? Qual a lógica ideal de merge ou prompt de atualização?
3. O que mais precisamos incluir nesse fluxo de onboarding (textos, links, guias gerados no terminal, next steps) para que a entrega fique com aspecto extremamente profissional e instrua perfeitamente o desenvolvedor sobre como começar a iterar com sua IA local?
```
