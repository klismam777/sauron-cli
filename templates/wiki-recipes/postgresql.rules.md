# PostgreSQL - Diretrizes de Banco de Dados e Queries

Este documento normatiza os padrões de modelagem, migrações e consultas SQL.

## 🎯 Regras Obrigatórias para a IA

1. **Migrações Cautelosas**:
   - Todas as alterações estruturais de banco de dados (DDL) devem passar por arquivos de migração versionados.
   - Evite alterações destrutivas em produção (como remoção de colunas). Prefira a abordagem de depreciação em fases (adiciona nova coluna, migra dados, remove antiga).

2. **Indexação Estratégica**:
   - Adicione índices explicitamente em colunas utilizadas em cláusulas `WHERE`, `JOIN` ou ordenações (`ORDER BY`).
   - Evite excesso de índices em colunas com alta taxa de escrita para não degradar a performance de inserts/updates.

3. **Consultas Seguras**:
   - Nunca concatene variáveis de entrada diretamente em queries SQL cruas. Utilize sempre parâmetros vinculados (Prepared Statements) para blindagem contra SQL Injection.

## 🚫 Práticas Banidas
- Queries com `SELECT *` em tabelas largas em produção. Especifique as colunas necessárias para reduzir overhead de tráfego de rede.
- Executar updates ou deletes sem cláusulas `WHERE` explícitas.
