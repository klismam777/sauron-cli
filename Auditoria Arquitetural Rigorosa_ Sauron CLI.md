# **Relatório de Auditoria Arquitetural: Sauron CLI**

**Data da Auditoria:** Junho de 2026

**Framework Alvo:** Node.js (CLI) / TypeScript

**Padrão Exigido:** Feature-Based Architecture & Separação de Camadas (Controller vs. Service)

## **1\. Veredito Executivo**

A implementação do Sauron CLI apresenta uma base tecnológica excelente. A escolha de bibliotecas modernas como @clack/prompts, fs-extra e a implementação do motor de diff para resolução de conflitos (idempotência) demonstra alta maturidade em Developer Experience (DX). Você isolou corretamente as pastas .sauron e .agents dentro de um diretório templates/ seguro.

No entanto, a arquitetura interna do código em src/ e a taxonomia da raiz do repositório ainda **violam regras fundamentais** da Arquitetura Baseada em Funcionalidades (Feature-Based Architecture) e da Separação de Conceitos (Separation of Concerns), exigindo refatoração imediata antes da escala.

## **2\. Desvios Arquiteturais Críticos (O que precisa mudar)**

### **2.1. O Anti-Padrão "Fat Controller" no src/commands/init.ts**

De acordo com as regras estritas para ecossistemas Node.js: *A comunicação deve fluir do Transporte para os Dados. O Controller lida apenas com tráfego/UI, sem regras de negócio, enquanto o Service é o cérebro.*

No contexto de uma CLI, o arquivo de Comando (init.ts) atua como o Controller (Transporte/UI). Atualmente, seu init.ts possui **112 linhas** e está fazendo de tudo:

1. Renderiza a UI (Logos e Prompts).  
2. Acessa o File System diretamente (fs.readdir, fs.readFile).  
3. Executa lógica pesada de negócio (validação de Hash, orquestração de merge).  
4. Gera artefatos dinâmicos (Template em string do AGENTS.md).

**O Risco:** Isso torna o comando impossível de testar de forma unitária (sem simular um terminal inteiro) e acopla a interface visual à lógica de injeção de arquivos.

### **2.2. Separação Técnica vs. Separação por Domínio (Arquitetura de Pastas)**

Você estruturou seu src/ em commands/ e engine/. Essa é uma separação baseada em *tipo de arquivo* (Arquitetura em Camadas clássica), que a engenharia de software contemporânea classificou como insustentável para escala corporativa.

A arquitetura correta exige a **Feature-Based Architecture**, agrupando tudo relacionado à "Inicialização" em um diretório próprio.

### **2.3. Persistência do Diretório .genesis**

Você enviou arquivos como Design de Onboarding para Sauron CLI.md e prompt-sauron-onboarding.md que ainda residem dentro de uma pasta .genesis/ (ou .genesis/prompts/). Como estabelecido anteriormente, diretórios ocultos na raiz do repositório devem ser estritamente para ferramentas de CI/infraestrutura. Documentação e planejamento não pertencem a *dot-folders*.

## **3\. A Topologia Definitiva (Plano de Refatoração)**

Para alinhar o Sauron CLI ao estado da arte (Feature-Sliced/Feature-Based), aplique a seguinte árvore de diretórios:

sauron-cli/  
├── docs/                             \<-- Novo lar para documentação interna  
│   ├── architecture/  
│   │   ├── Design de Onboarding para Sauron CLI.md  
│   │   └── sauron\_cli\_implementation\_plan.md  
│   └── prompts/  
│       └── prompt-sauron-onboarding.md  
├── templates/                        \<-- (Correto) Isolamento dos assets  
│   ├── .agents/  
│   └── .sauron/  
└── src/  
    ├── index.ts                      \<-- Bootstrapper (Apenas orquestração do Commander)  
    ├── core/                         \<-- Substitui a pasta 'engine/' (Serviços Agnósticos)  
    │   ├── manifest.service.ts       \<-- Antigo manifest.ts  
    │   └── merge.service.ts          \<-- Antigo merge.ts  
    └── features/                     \<-- Nova taxonomia orientada a negócios  
        ├── init/                     \<-- Domínio de Inicialização  
        │   ├── init.command.ts       \<-- Apenas UI (@clack/prompts) e passagem de args  
        │   ├── init.service.ts       \<-- Lógica pesada (FileSystem, orquestração)  
        │   └── templates.ts          \<-- Strings estáticas (como o corpo do AGENTS.md)  
        └── sync/                     \<-- Futuro domínio (sauron push/pull)

## **4\. Como Desacoplar o Comando init (Execução)**

### **Passo 1: O Service (O "Cérebro" Imaculado)**

Crie src/features/init/init.service.ts. Ele **não deve saber nada sobre terminal, cores (picocolors) ou spinners**. Ele apenas recebe as opções e executa o trabalho.

// src/features/init/init.service.ts  
import fs from 'fs-extra';  
import path from 'path';  
import { getManifest, saveManifest, generateHash } from '../../core/manifest.service.js';  
import { resolveConflict } from '../../core/merge.service.js';  
// importe o gerador de texto do AGENTS.md de um arquivo isolado

export interface InitOptions {  
  aiTargets: string\[\];  
  severity: string;  
  projectContext: string;  
  projectStack: string;  
  cwd: string;  
}

export class InitService {  
  async execute(options: InitOptions, onConflict: (file: string) \=\> Promise\<'ours'|'theirs'\>) {  
    // 1\. Lógica de leitura dos templates (fs-extra)  
    // 2\. Loop recursivo  
    // 3\. Se encontrar conflito, NÃO use o @clack aqui.   
    //    Chame o callback de injeção de dependência: await onConflict(relPath);  
    // 4\. Gere e salve o AGENTS.md  
    // 5\. Salve o .manifest.json  
  }  
}

### **Passo 2: O Command (O "Transporte"/UI)**

Seu init.command.ts ficará extremamente limpo. O papel dele é exibir o texto bonito, coletar os dados do usuário via @clack/prompts e passar para o InitService.

// src/features/init/init.command.ts  
import \* as p from '@clack/prompts';  
import pc from 'picocolors';  
import { InitService } from './init.service.js';

export async function runInitCommand(options: { yes?: boolean }) {  
  // 1\. Mostrar Logo e Introdução  
  // 2\. Fazer perguntas (Prompt Group)  
  // 3\. Extrair respostas  
    
  const s \= p.spinner();  
  s.start('Injetando o Cérebro da IA no repositório...');

  const initService \= new InitService();  
    
  try {  
    await initService.execute(  
      { /\* opções coletadas \*/ },   
      async (filePath) \=\> {  
        // Callback de conflito\! O UI lida com o UI.  
        s.stop(\`Conflito em ${filePath}\`);  
        // Chamar interface de resolução visual aqui  
        const decision \= await showConflictUI(filePath);   
        s.start('Continuando injeção...');  
        return decision;  
      }  
    );  
      
    s.stop('Injeção finalizada.');  
    p.outro(pc.green('Instalado com sucesso\!'));  
  } catch (error) {  
    s.stop('Falha na instalação.');  
    p.cancel(error.message);  
  }  
}

## **5\. Auditoria de Governança (.npmignore e .gitignore)**

* **Problema:** O seu package.json define a biblioteca como global (bin: { "sauron": "./dist/index.js" }), mas você precisa garantir que templates sejam empacotados na compilação.  
* **Ação .npmignore:** Remova a linha .genesis/ (pois você vai excluir essa pasta). Certifique-se de ignorar a pasta docs/ recém-criada, pois manuais internos não devem ir para o registro do NPM. No entanto, a pasta templates/ **não deve ser ignorada**, ou os usuários baixarão a CLI sem a estrutura base para ejetar.

## **Conclusão**

Sua visão sobre orquestração passiva está perfeitamente refletida no código de templates (SKILL.md e memory.md). A mecânica de sincronização do summary.json exigirá resiliência matemática forte (Hashes). Ao separar a lógica no InitService, você garante que, quando for construir o comando de validação (sauron check do seu Roadmap), poderá reaproveitar as funções de abstração de arquivos sem instanciar rotinas de console.