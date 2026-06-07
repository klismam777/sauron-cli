# Prompt: Migração da Governança e CLI para Inglês

```text
Atualmente, todo o meu projeto, incluindo código, documentação interna, templates de regras para a IA e saídas interativas do terminal, está em Português do Brasil.
Gostaria de avaliar se traduzir todo o domínio do projeto (especialmente as instruções estruturais que a IA lê) para o Inglês aumentará a aderência, eficácia e obediência do modelo às regras de arquitetura.

O projeto é o "Sauron CLI", um framework de "governança e memória" passiva para assistentes de código com IA (como Cursor, Windsurf e Aider). Ele injeta diretórios de memória (`.sauron` e `.agents`) nos repositórios para forçar as IAs a documentarem mudanças (Write Obligation) e assim resolver o problema de "amnésia de contexto" entre as sessões. O projeto possui um tom sério, corporativo e com uma leve inspiração cyberpunk.

Stack Técnica: Node.js, TypeScript, Commander.js, tsup, fs-extra, @clack/prompts.

Preciso de uma análise direta sobre os seguintes pontos:
1. IAs (LLMs modernos) realmente trabalham melhor e obedecem regras complexas de forma mais rigorosa se os system prompts estruturais (como as regras dentro da pasta .sauron) estiverem em Inglês em vez de Português? Qual é o impacto real na capacidade de raciocínio lógico (reasoning) do modelo?
2. Se a resposta for sim, qual a melhor estratégia técnica para migrar os templates do Sauron CLI para o Inglês sem perder o "tom de voz" imponente do projeto?
3. Faz sentido adotar uma arquitetura híbrida onde as regras lidas pelas IAs (.agents/rules) ficam em Inglês, mas as saídas do terminal (CLI prompts) que o desenvolvedor humano lê continuam em Português? Ou isso gera confusão de contexto para o agente que está operando a CLI?
```
