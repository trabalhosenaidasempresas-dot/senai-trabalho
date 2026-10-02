# Guia de Testes - SIGA Secult

## 🧪 Teste Rápido do Sistema

### Pré-requisitos
- Node.js instalado
- PostgreSQL instalado e rodando
- Banco de dados criado

### 1. Setup Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar .env
cp .env.example .env

# Editar .env com sua conexão PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/siga_secult"

# Criar tabelas
npm run prisma:migrate

# Inserir dados padrão
npm run prisma:seed

# Iniciar servidor
npm run dev
```

**Resultado esperado:**
```
✓ Servidor SIGA Secult rodando em http://localhost:3000
```

### 2. Setup Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar dev server
npm run dev
```

**Resultado esperado:**
```
  ➜  Local:   http://localhost:3001
```

### 3. Testar Autenticação

#### Login:
1. Acesse http://localhost:3001
2. Será redirecionado para /login
3. Use credenciais:
   - **Email:** admin@secult.com
   - **Senha:** admin123

**Resultado esperado:**
- ✅ Login realizado com sucesso
- ✅ Redirecionado para dashboard
- ✅ Token armazenado em localStorage

### 4. Testar API

Use Postman, Insomnia ou curl:

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@secult.com","senha":"admin123"}'
```

**Resposta esperada:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "...",
    "nome": "Administrador",
    "email": "admin@secult.com",
    "perfil": "Administrador",
    "setor": "TI"
  }
}
```

#### Listar Usuários (requer token)
```bash
curl -X GET http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer {TOKEN}"
```

#### Criar Usuário
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "nome": "Novo Usuário",
    "email": "novo@secult.com",
    "senha": "senha123",
    "telefone": "(27) 9999-9999",
    "setor": "RH",
    "perfil": "Servidor"
  }'
```

#### Atualizar Usuário
```bash
curl -X PUT http://localhost:3000/api/usuarios/{ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{"nome": "Nome Atualizado"}'
```

#### Deletar Usuário
```bash
curl -X DELETE http://localhost:3000/api/usuarios/{ID} \
  -H "Authorization: Bearer {TOKEN}"
```

### 5. Testar Dashboard

1. Após login, você estará no dashboard
2. Verifique:
   - ✅ Navbar com nome do usuário
   - ✅ Sidebar com menu de módulos
   - ✅ Cards de estatísticas
   - ✅ Menu dropdown do usuário

### 6. Testar Permissões

#### Teste com Gestor
```bash
# Login como gestor
curl -X POST http://localhost:3000/api/auth/login \
  -d '{"email":"gestor@secult.com","senha":"gestor123"}'
```

#### Tente criar usuário (deve ser negado)
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer {TOKEN_GESTOR}" \
  -d '{"nome":"Teste","email":"teste@secult.com",...}'
```

**Resultado esperado:**
```json
{
  "message": "Acesso negado. Permissão insuficiente."
}
```

### 7. Testar Banco de Dados

Verificar tabelas:
```bash
psql -U user -d siga_secult

# Dentro do PostgreSQL:
\dt
SELECT * FROM usuarios;
```

## 🐛 Troubleshooting

### Erro de conexão com BD
- Verifique se PostgreSQL está rodando
- Verifique DATABASE_URL em .env
- Execute: `npm run prisma:migrate`

### Frontend não conecta ao backend
- Verifique se backend está rodando em :3000
- Verifique proxy em vite.config.js
- Verifique CORS em server.js

### Token expirado
- Token padrão expira em 24h
- Para renovar: POST /api/auth/refresh
- Implementar renovação automática no frontend

## 📊 Estrutura de Teste

```
Teste de Autenticação
├── Login válido ✅
├── Login inválido ✅
├── Token refresh ✅
├── Token expirado ✅
└── Logout ✅

Teste de Usuários
├── Listar ✅
├── Obter por ID ✅
├── Criar ✅
├── Atualizar ✅
├── Deletar ✅
└── Upload foto ✅

Teste de Permissões
├── Admin ✅
├── Gestor ✅
├── Servidor ✅
└── Visitante ✅

Interface
├── Login page ✅
├── Dashboard ✅
├── Navbar ✅
├── Sidebar ✅
└── Responsividade ✅
```

## ✅ Checklist de Testes

- [ ] Backend inicia sem erros
- [ ] Frontend inicia sem erros
- [ ] Login com admin funciona
- [ ] Dashboard carrega
- [ ] API retorna usuários
- [ ] Pode criar novo usuário
- [ ] Pode atualizar usuário
- [ ] Pode deletar usuário
- [ ] Permissões funcionam
- [ ] Upload de foto funciona
- [ ] Logout funciona
- [ ] Token persiste no localStorage
- [ ] Menu dropdown funciona
- [ ] Sidebar responsiva

## 🚀 Próximos Testes

1. Teste de módulo Documentos
2. Teste de módulo Compras
3. Teste de módulo Estoque
4. Testes de performance
5. Testes de segurança
6. Testes de stress
