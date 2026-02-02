# 🚀 Guia Rápido de Inicialização

## Passo 1: Configurar o Banco de Dados

1. Abra o PostgreSQL (pgAdmin ou terminal)
2. Execute os scripts do arquivo `database.md`
3. Verifique se o banco `dlfinance` foi criado com sucesso

**Via terminal PostgreSQL:**
```bash
psql -U postgres

# Depois execute os comandos do database.md manualmente
# Ou crie um arquivo database.sql e execute:
\i database.sql
```

## Passo 2: Iniciar o Backend

Abra um terminal no diretório do projeto:

```bash
cd back
npm run start:dev
```

✅ O backend deve iniciar em: http://localhost:3001
✅ Você verá a mensagem: "✅ Conectado ao PostgreSQL com sucesso!"

Se houver erro de conexão, crie um arquivo `.env` no diretório `back/` com:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dlfinance
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_AQUI
PORT=3001
```

## Passo 3: Iniciar o Frontend

Abra **outro terminal** no diretório do projeto:

```bash
cd front
npm run dev
```

✅ O frontend deve iniciar em: http://localhost:5173
✅ Abra o navegador e acesse: http://localhost:5173

## 🎯 Primeiros Passos no App

1. **Criar suas primeiras categorias:**
   - Clique em "Categorias" no menu
   - Adicione: "Gastos", "Investimentos", "Lanches", "Mercado"
   - Escolha cores diferentes para cada uma

2. **Fazer seus primeiros lançamentos:**
   - Clique em "Lançamentos"
   - Adicione uma entrada ou saída
   - Selecione a categoria
   - Veja o saldo atualizar automaticamente!

3. **Acompanhar no Dashboard:**
   - Volte para a página inicial
   - Veja o resumo geral e por categoria

## 🔧 Comandos Úteis

### Reiniciar o Backend
```bash
# Ctrl+C para parar
# Depois:
npm run start:dev
```

### Reiniciar o Frontend
```bash
# Ctrl+C para parar
# Depois:
npm run dev
```

### Ver logs do PostgreSQL
```bash
# No terminal do PostgreSQL:
SELECT * FROM categorias;
SELECT * FROM lancamentos;
```

## 📱 Testando no Mobile

Para testar no celular na mesma rede:

1. Descubra o IP do seu computador:
   ```bash
   # Windows:
   ipconfig
   # Procure por "IPv4"
   ```

2. No frontend, edite `front/src/services/api.ts`:
   ```typescript
   baseURL: 'http://SEU_IP:3001'
   ```

3. Reinicie o frontend

4. No celular, acesse: `http://SEU_IP:5173`

## ❗ Troubleshooting

### Erro: "Cannot connect to database"
- Verifique se o PostgreSQL está rodando
- Confira usuário e senha no arquivo `.env`
- Teste a conexão: `psql -U postgres -d dlfinance`

### Erro: "Network Error" no frontend
- Verifique se o backend está rodando
- Teste: abra http://localhost:3001 no navegador
- Verifique a URL em `front/src/services/api.ts`

### Página em branco no frontend
- Abra o console do navegador (F12)
- Verifique se há erros
- Certifique-se que o backend está respondendo

## 🎨 Personalização

### Mudar as cores do tema
Edite: `front/src/plugins/vuetify.ts`

### Adicionar novos campos
1. Altere as tabelas no banco (cuidado!)
2. Atualize as interfaces em `back/src/.../interface.ts`
3. Atualize os services e controllers
4. Atualize os componentes Vue

Divirta-se com seu novo sistema de controle de gastos! 💰✨
