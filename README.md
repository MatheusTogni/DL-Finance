# DL Finance - Sistema de Controle de Gastos

Sistema focado em mobile para controle de gastos pessoais, desenvolvido com NestJS (backend) e Vue + Vuetify (frontend).

## 🎨 Características

- Interface mobile-first com tema roxo e preto
- Gestão de categorias personalizadas (gastos, investimentos, lanches, mercado, etc)
- Lançamentos de entrada e saída por categoria
- Dashboard com resumo geral e por categoria
- Atualização automática de saldos via triggers no banco de dados
- Sem autenticação (uso pessoal)

## 🛠️ Tecnologias

### Backend
- NestJS
- PostgreSQL (sem ORM - SQL puro)
- Node.js

### Frontend
- Vue 3
- Vuetify 3
- TypeScript
- Axios
- Vite

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## 🚀 Instalação

### 1. Configurar o Banco de Dados

Execute os scripts SQL do arquivo [database.md](database.md) para criar as tabelas e triggers necessários:

```bash
# Conecte ao PostgreSQL
psql -U postgres

# Execute os comandos do database.md
# Ou execute diretamente via arquivo:
psql -U postgres -f database.sql
```

### 2. Configurar o Backend

```bash
cd back

# Instalar dependências (já feito)
npm install

# Criar arquivo .env (opcional - caso queira customizar)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=dlfinance
# DB_USER=postgres
# DB_PASSWORD=sua_senha
# PORT=3001

# Iniciar o backend
npm run start:dev
```

O backend estará rodando em: http://localhost:3001

### 3. Configurar o Frontend

```bash
cd front

# Instalar dependências (já feito)
npm install

# Iniciar o frontend
npm run dev
```

O frontend estará rodando em: http://localhost:5173

## 📱 Como Usar

### 1. Criar Categorias

1. Acesse a página "Categorias"
2. Clique em "Nova Categoria"
3. Preencha:
   - Nome: ex. "Lanches", "Mercado", "Investimentos"
   - Tipo: ex. "gastos", "investimentos"
   - Cor: escolha uma cor em hexadecimal (ex: #9C27B0)
   - Saldo Inicial: valor inicial da categoria (opcional)
4. Clique em "Salvar"

### 2. Fazer Lançamentos

1. Acesse a página "Lançamentos"
2. Clique em "Novo Lançamento"
3. Preencha:
   - Categoria: selecione a categoria
   - Tipo: "Entrada" ou "Saída"
   - Valor: valor do lançamento
   - Descrição: descrição opcional
   - Data: data e hora do lançamento
4. Clique em "Salvar"

O saldo da categoria será atualizado automaticamente!

### 3. Acompanhar no Dashboard

A página inicial (Dashboard) mostra:
- Total de entradas e saídas
- Saldo total
- Resumo por categoria
- Últimos lançamentos

## 🎨 Personalização

### Alterar Cores do Tema

Edite o arquivo `front/src/plugins/vuetify.ts`:

```typescript
colors: {
  primary: '#9C27B0', // Roxo principal
  secondary: '#7B1FA2', // Roxo escuro
  accent: '#BA68C8', // Roxo claro
  background: '#121212', // Preto
  surface: '#1E1E1E', // Cinza escuro
}
```

### Alterar URL da API

Edite o arquivo `front/src/services/api.ts`:

```typescript
const api = axios.create({
  baseURL: 'http://localhost:3001', // Altere aqui
});
```

## 📊 Estrutura do Banco de Dados

### Tabela: categorias
- `id`: ID único
- `nome`: Nome da categoria
- `saldo_atual`: Saldo atual (atualizado automaticamente)
- `tipo`: Tipo da categoria
- `cor`: Cor em hexadecimal
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### Tabela: lancamentos
- `id`: ID único
- `categoria_id`: Referência à categoria
- `descricao`: Descrição do lançamento
- `valor`: Valor do lançamento
- `tipo_lancamento`: "entrada" ou "saida"
- `data_lancamento`: Data do lançamento
- `created_at`: Data de criação

## 🔧 Scripts Disponíveis

### Backend
```bash
npm run start        # Iniciar em produção
npm run start:dev    # Iniciar em desenvolvimento (com hot reload)
npm run build        # Compilar para produção
```

### Frontend
```bash
npm run dev          # Iniciar em desenvolvimento
npm run build        # Compilar para produção
npm run preview      # Visualizar build de produção
```

## 📝 Endpoints da API

### Categorias
- `GET /categorias` - Listar todas
- `GET /categorias/resumo` - Listar com estatísticas
- `GET /categorias/:id` - Buscar por ID
- `POST /categorias` - Criar nova
- `PUT /categorias/:id` - Atualizar
- `DELETE /categorias/:id` - Excluir

### Lançamentos
- `GET /lancamentos` - Listar todos
- `GET /lancamentos?categoria_id=X` - Filtrar por categoria
- `GET /lancamentos/estatisticas` - Estatísticas gerais
- `GET /lancamentos/:id` - Buscar por ID
- `POST /lancamentos` - Criar novo
- `PUT /lancamentos/:id` - Atualizar
- `DELETE /lancamentos/:id` - Excluir

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no backend
- Verifique se o banco "dlfinance" foi criado

### Erro de CORS
- Verifique se o backend está rodando na porta 3001
- Confirme a URL no arquivo `front/src/services/api.ts`

### Frontend não carrega dados
- Verifique se o backend está rodando
- Abra o console do navegador (F12) para ver erros
- Teste os endpoints diretamente no navegador ou Postman

## 📄 Licença

Projeto pessoal - uso livre
