# Dados de Exemplo para DL Finance

Execute estes comandos SQL depois de criar as tabelas para popular o banco com dados de exemplo.

```sql
-- Inserir categorias de exemplo
INSERT INTO categorias (nome, tipo, cor, saldo_atual) VALUES
('Gastos Gerais', 'gastos', '#9C27B0', 0.00),
('Investimentos', 'investimentos', '#7B1FA2', 0.00),
('Lanches', 'lanches', '#6A1B9A', 0.00),
('Mercado', 'mercado', '#4A148C', 0.00),
('Contas', 'contas', '#8E24AA', 0.00),
('Lazer', 'lazer', '#AB47BC', 0.00);

-- Inserir lançamentos de exemplo
-- (Os saldos das categorias serão atualizados automaticamente pelos triggers)

-- Categoria: Mercado (ID 4)
INSERT INTO lancamentos (categoria_id, descricao, valor, tipo_lancamento, data_lancamento) VALUES
(4, 'Compras do mês', 450.00, 'saida', NOW() - INTERVAL '5 days'),
(4, 'Feira de frutas', 85.00, 'saida', NOW() - INTERVAL '3 days'),
(4, 'Padaria', 35.50, 'saida', NOW() - INTERVAL '1 day');

-- Categoria: Lanches (ID 3)
INSERT INTO lancamentos (categoria_id, descricao, valor, tipo_lancamento, data_lancamento) VALUES
(3, 'Lanche na padaria', 12.50, 'saida', NOW() - INTERVAL '4 days'),
(3, 'Cafeteria', 18.00, 'saida', NOW() - INTERVAL '2 days'),
(3, 'Fast food', 35.00, 'saida', NOW() - INTERVAL '1 day');

-- Categoria: Investimentos (ID 2)
INSERT INTO lancamentos (categoria_id, descricao, valor, tipo_lancamento, data_lancamento) VALUES
(2, 'Aplicação inicial', 1000.00, 'entrada', NOW() - INTERVAL '10 days'),
(2, 'Rendimento mensal', 45.50, 'entrada', NOW() - INTERVAL '2 days'),
(2, 'Nova aplicação', 500.00, 'entrada', NOW() - INTERVAL '1 day');

-- Categoria: Contas (ID 5)
INSERT INTO lancamentos (categoria_id, descricao, valor, tipo_lancamento, data_lancamento) VALUES
(5, 'Conta de luz', 180.00, 'saida', NOW() - INTERVAL '7 days'),
(5, 'Conta de água', 95.00, 'saida', NOW() - INTERVAL '6 days'),
(5, 'Internet', 120.00, 'saida', NOW() - INTERVAL '5 days');

-- Categoria: Lazer (ID 6)
INSERT INTO lancamentos (categoria_id, descricao, valor, tipo_lancamento, data_lancamento) VALUES
(6, 'Cinema', 45.00, 'saida', NOW() - INTERVAL '3 days'),
(6, 'Streaming', 29.90, 'saida', NOW() - INTERVAL '2 days');

-- Categoria: Gastos Gerais (ID 1)
INSERT INTO lancamentos (categoria_id, descricao, valor, tipo_lancamento, data_lancamento) VALUES
(1, 'Salário', 3500.00, 'entrada', NOW() - INTERVAL '15 days'),
(1, 'Freelance', 800.00, 'entrada', NOW() - INTERVAL '5 days'),
(1, 'Diversos', 150.00, 'saida', NOW() - INTERVAL '2 days');

-- Verificar os saldos atualizados
SELECT 
    c.nome,
    c.saldo_atual,
    COUNT(l.id) as total_lancamentos
FROM categorias c
LEFT JOIN lancamentos l ON c.id = l.categoria_id
GROUP BY c.id, c.nome, c.saldo_atual
ORDER BY c.nome;
```

## Resultado Esperado

Após executar os comandos acima, você terá:

### Categorias com Saldos:
- **Gastos Gerais**: +R$ 4.150,00 (4.300 entrada - 150 saída)
- **Investimentos**: +R$ 1.545,50 (todas entradas)
- **Lanches**: -R$ 65,50 (todas saídas)
- **Mercado**: -R$ 570,50 (todas saídas)
- **Contas**: -R$ 395,00 (todas saídas)
- **Lazer**: -R$ 74,90 (todas saídas)

### Total Geral:
- **Total de Entradas**: R$ 5.845,50
- **Total de Saídas**: R$ 1.255,90
- **Saldo Total**: R$ 4.589,60
- **Total de Lançamentos**: 18

## Como Limpar os Dados de Exemplo

Se quiser remover os dados de exemplo e começar do zero:

```sql
-- Deletar todos os lançamentos
DELETE FROM lancamentos;

-- Deletar todas as categorias
DELETE FROM categorias;

-- Resetar os contadores de ID (opcional)
ALTER SEQUENCE categorias_id_seq RESTART WITH 1;
ALTER SEQUENCE lancamentos_id_seq RESTART WITH 1;
```
