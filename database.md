# Scripts de Banco de Dados - Sistema de Controle de Gastos

## Configuração Inicial

```sql
-- Criar o banco de dados (executar como superusuário)
CREATE DATABASE dlfinance;

-- Conectar ao banco
\c dlfinance;
```

## Tabelas

### 1. Tabela de Categorias

```sql
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    saldo_atual DECIMAL(10, 2) DEFAULT 0.00,
    tipo VARCHAR(50) NOT NULL, -- gastos, investimentos, lanches, etc
    cor VARCHAR(7) DEFAULT '#9C27B0', -- cor em hexadecimal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca por tipo
CREATE INDEX idx_categorias_tipo ON categorias(tipo);
```

### 2. Tabela de Lançamentos

```sql
CREATE TABLE lancamentos (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    descricao VARCHAR(255),
    valor DECIMAL(10, 2) NOT NULL,
    tipo_lancamento VARCHAR(20) NOT NULL, -- entrada ou saida
    data_lancamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valor_positivo CHECK (valor > 0)
);

-- Índices para otimização
CREATE INDEX idx_lancamentos_categoria ON lancamentos(categoria_id);
CREATE INDEX idx_lancamentos_data ON lancamentos(data_lancamento DESC);
```

### 3. Trigger para atualizar saldo da categoria

```sql
-- Função para atualizar saldo da categoria
CREATE OR REPLACE FUNCTION atualizar_saldo_categoria()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.tipo_lancamento = 'entrada' THEN
            UPDATE categorias 
            SET saldo_atual = saldo_atual + NEW.valor,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.categoria_id;
        ELSIF NEW.tipo_lancamento = 'saida' THEN
            UPDATE categorias 
            SET saldo_atual = saldo_atual - NEW.valor,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.categoria_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.tipo_lancamento = 'entrada' THEN
            UPDATE categorias 
            SET saldo_atual = saldo_atual - OLD.valor,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = OLD.categoria_id;
        ELSIF OLD.tipo_lancamento = 'saida' THEN
            UPDATE categorias 
            SET saldo_atual = saldo_atual + OLD.valor,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = OLD.categoria_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverte o lançamento antigo
        IF OLD.tipo_lancamento = 'entrada' THEN
            UPDATE categorias 
            SET saldo_atual = saldo_atual - OLD.valor
            WHERE id = OLD.categoria_id;
        ELSE
            UPDATE categorias 
            SET saldo_atual = saldo_atual + OLD.valor
            WHERE id = OLD.categoria_id;
        END IF;
        
        -- Aplica o novo lançamento
        IF NEW.tipo_lancamento = 'entrada' THEN
            UPDATE categorias 
            SET saldo_atual = saldo_atual + NEW.valor,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.categoria_id;
        ELSE
            UPDATE categorias 
            SET saldo_atual = saldo_atual - NEW.valor,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.categoria_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_atualizar_saldo
AFTER INSERT OR UPDATE OR DELETE ON lancamentos
FOR EACH ROW
EXECUTE FUNCTION atualizar_saldo_categoria();
```

## Dados Iniciais (Opcional)

```sql
-- Inserir categorias de exemplo
INSERT INTO categorias (nome, tipo, cor, saldo_atual) VALUES
('Gastos Gerais', 'gastos', '#9C27B0', 0.00),
('Investimentos', 'investimentos', '#7B1FA2', 0.00),
('Lanches', 'lanches', '#6A1B9A', 0.00),
('Mercado', 'mercado', '#4A148C', 0.00);
```

## Consultas Úteis

```sql
-- Ver todas as categorias com seus saldos
SELECT * FROM categorias ORDER BY nome;

-- Ver lançamentos de uma categoria específica
SELECT l.*, c.nome as categoria_nome 
FROM lancamentos l
JOIN categorias c ON l.categoria_id = c.id
WHERE c.id = 1
ORDER BY l.data_lancamento DESC;

-- Ver resumo por categoria
SELECT 
    c.nome,
    c.saldo_atual,
    COUNT(l.id) as total_lancamentos,
    SUM(CASE WHEN l.tipo_lancamento = 'entrada' THEN l.valor ELSE 0 END) as total_entradas,
    SUM(CASE WHEN l.tipo_lancamento = 'saida' THEN l.valor ELSE 0 END) as total_saidas
FROM categorias c
LEFT JOIN lancamentos l ON c.id = l.categoria_id
GROUP BY c.id, c.nome, c.saldo_atual
ORDER BY c.nome;
```

## Configuração de Conexão

Para conectar sua aplicação ao banco:

```
Host: localhost
Port: 5432
Database: dlfinance
User: postgres (ou seu usuário)
Password: sua_senha
```
