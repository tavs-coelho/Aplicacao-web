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

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (JWT_SECRET é obrigatório):

```env
# Obrigatório - Use uma chave forte e aleatória
JWT_SECRET=sua-chave-secreta-muito-forte-e-aleatoria-aqui

# Opcionais - valores padrão mostrados
POSTGRES_USER=fielduser
POSTGRES_PASSWORD=fieldpass
POSTGRES_DB=fieldservice
CORS_ORIGIN=true
```

**Nota:** A variável `JWT_SECRET` é obrigatória. O sistema não iniciará sem ela.

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

## 📱 Testando o App Mobile no Celular com Ngrok

Para apresentar o app mobile rodando no seu celular físico conectando ao backend no seu PC, você pode usar o **Ngrok** para expor sua API local para a internet.

### 1. Instalar o Ngrok

Se ainda não tem o Ngrok instalado:

```bash
# macOS (via Homebrew)
brew install ngrok/ngrok/ngrok

# Windows (via Chocolatey)
choco install ngrok

# Linux (via snap)
snap install ngrok

# Ou baixe diretamente: https://ngrok.com/download
```

Após instalar, autentique-se (crie uma conta gratuita em https://ngrok.com):

```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

### 2. Iniciar o Backend

Primeiro, inicie o backend na porta 3000:

```bash
# Com Docker
docker compose up -d --build

# Ou localmente
npm start
```

### 3. Expor a Porta 3000 com Ngrok

Em outro terminal, execute:

```bash
ngrok http 3000
```

Você verá uma saída como:

```
Session Status                online
Account                       seu-email@exemplo.com
Forwarding                    https://abc123xyz.ngrok-free.app -> http://localhost:3000
```

O endereço `https://abc123xyz.ngrok-free.app` é seu endpoint público temporário.

### 4. Configurar o App Mobile

#### Opção A: Usando Variável de Ambiente (Recomendado)

Na pasta `mobile/`, crie um arquivo `.env` baseado no `.env.example`:

```bash
cd mobile
cp .env.example .env
```

Edite o arquivo `.env` e coloque o endereço do Ngrok:

```env
EXPO_PUBLIC_API_URL=https://abc123xyz.ngrok-free.app
```

#### Opção B: Alterando Diretamente no Código

O arquivo que contém a configuração da URL base da API está em:

**`mobile/src/services/api.ts`** (linha 4):

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
```

Você pode temporariamente substituir para:

```typescript
const API_BASE_URL = 'https://abc123xyz.ngrok-free.app';
```

> ⚠️ **Importante:** Lembre-se de reverter essa alteração antes de fazer commit!

### 5. Iniciar o App Mobile

```bash
cd mobile
npm install  # se ainda não instalou as dependências
npm start
```

Escaneie o QR code com o app **Expo Go** no seu celular.

### ⚠️ Observações Importantes

1. **O endereço do Ngrok muda a cada sessão** (na versão gratuita). Você precisará atualizar a `EXPO_PUBLIC_API_URL` cada vez que reiniciar o Ngrok.

2. **Versão gratuita do Ngrok** mostra uma página de aviso na primeira requisição. Se tiver problemas, você pode adicionar o header `ngrok-skip-browser-warning` nas requisições. Exemplo de como adicionar no arquivo `mobile/src/services/api.ts`:
   ```typescript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json',
     'ngrok-skip-browser-warning': 'true',  // Adicione esta linha
   },
   ```

3. **CORS**: Se tiver problemas de CORS, certifique-se de que a variável `CORS_ORIGIN=true` está configurada no backend.

4. **Conexão**: Certifique-se de que seu celular tem acesso à internet (dados móveis ou Wi-Fi).
