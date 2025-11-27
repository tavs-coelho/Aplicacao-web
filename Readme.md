# Sistema de Gestão de Equipes Externas (Field Service Management System)

API para gerenciamento de ordens de serviço, técnicos e clientes.

## 🐳 Docker - Execução Rápida

### Pré-requisitos
- Docker e Docker Compose instalados no seu sistema

### Como rodar tudo com um único comando

```bash
docker compose up --build
```

Este comando irá:
1. Criar e iniciar o container do PostgreSQL
2. Criar e iniciar o container da API
3. Executar as migrações do banco de dados automaticamente

### Acessar a aplicação
- **API**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

### Variáveis de Ambiente (opcional)

Você pode personalizar as configurações criando um arquivo `.env` na raiz do projeto:

```env
POSTGRES_USER=fielduser
POSTGRES_PASSWORD=fieldpass
POSTGRES_DB=fieldservice
JWT_SECRET=sua-chave-secreta-segura
CORS_ORIGIN=true
```

### Comandos úteis

```bash
# Iniciar os serviços em segundo plano
docker compose up -d --build

# Parar os serviços
docker compose down

# Ver logs da aplicação
docker compose logs -f api

# Ver logs do banco de dados
docker compose logs -f db

# Parar e remover volumes (apaga os dados do banco)
docker compose down -v
```

## 📖 Desenvolvimento Local (sem Docker)

### Requisitos
- Node.js 20+
- PostgreSQL

### Instalação

```bash
npm install
```

### Configuração

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp .env.example .env
```

### Executar migrações

```bash
npx prisma migrate deploy
```

### Iniciar servidor

```bash
npm start
```

## Testes

```bash
npm test
```
