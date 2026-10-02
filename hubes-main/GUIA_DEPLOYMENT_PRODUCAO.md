# GUIA COMPLETO DE MIGRAÇÃO E DEPLOYMENT

## PASSO 1: PREPARAR SUPABASE

### 1.1 Criar as Tabelas

1. Acesse o [Supabase Console](https://app.supabase.com)
2. Navegar para seu projeto: `dfezipycqsgxwdrfowrb`
3. Ir para **SQL Editor** (painel lateral esquerdo)
4. Clicar em **New Query**
5. Copiar e colar todo o conteúdo do arquivo `SUPABASE_SCHEMA.sql`
6. Clicar em **Run** (Ctrl+Enter)
7. Aguardar conclusão (deve mostrar "Success")

### 1.2 Verificar Extensões

Execute no SQL Editor do Supabase:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SELECT * FROM pg_extension;
```

---

## PASSO 2: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 2.1 Backend (.env)

O arquivo `backend/.env` já foi criado com as credenciais do Supabase.

**Localização:** `backend/.env`

```env
# Supabase Configuration
DATABASE_URL="postgresql://postgres:7820@Mdavel@db.dfezipycqsgxwdrfowrb.supabase.co:5432/postgres"
SUPABASE_URL="https://dfezipycqsgxwdrfowrb.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# JWT Configuration
JWT_SECRET="MudarpCQTUCOMumasenhasuperSegura123!@"
JWT_EXPIRE="24h"
JWT_REFRESH_EXPIRE="7d"

# Server
PORT=3000
NODE_ENV="development"
```

**⚠️ IMPORTANTE:** Altere `JWT_SECRET` para uma senha forte em produção!

### 2.2 Frontend (.env.development)

Já criado em `frontend/.env`

### 2.3 Frontend (.env.production)

Já criado em `frontend/.env.production`

**Ajuste necessário:**
- Altere `VITE_API_URL` para o URL real do seu backend em produção (ex: `https://seu-backend.herokuapp.com`)

---

## PASSO 3: INSTALAR DEPENDÊNCIAS

### 3.1 Backend

```bash
cd backend
npm install
```

### 3.2 Frontend

```bash
cd frontend
npm install
```

---

## PASSO 4: TESTAR LOCALMENTE

### 4.1 Iniciar Backend

```bash
cd backend
npm run dev
```

Deverá mostrar:
```
✓ Servidor SIGA Secult rodando em http://localhost:3000
```

### 4.2 Iniciar Frontend (em outro terminal)

```bash
cd frontend
npm run dev
```

Deverá abrir em `http://localhost:3001`

### 4.3 Testar Conexão

1. Acesse `http://localhost:3000/api/health`
2. Deverá retornar:
```json
{
  "success": true,
  "message": "SIGA Secult Backend está rodando!"
}
```

---

## PASSO 5: DEPLOYAR NO VERCEL

### 5.1 Preparar Repositório Git

```bash
# No diretório raiz do projeto
git init
git add .
git commit -m "Initial commit - SIGA Secult with Supabase"
```

### 5.2 Enviar para GitHub

1. Criar repositório em [github.com](https://github.com/new)
2. Nomear como `siga-secult`
3. Não inicializar com README (já temos)

```bash
git remote add origin https://github.com/seu-usuario/siga-secult.git
git branch -M main
git push -u origin main
```

### 5.3 Conectar Vercel

#### Opção A: Frontend no Vercel

1. Acesdar [vercel.com](https://vercel.com)
2. Clicar em "New Project"
3. Importar repositório GitHub `siga-secult`
4. Framework: Vite
5. Root Directory: `frontend`
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Environment Variables:
   - `VITE_API_URL`: URL do seu backend (ex: `https://siga-backend.herokuapp.com`)
   - `VITE_SUPABASE_URL`: `https://dfezipycqsgxwdrfowrb.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: (copiar de `frontend/.env.production`)
9. Clicar "Deploy"

#### Opção B: Backend (Node.js) - Múltiplas Opções

##### Opção B1: Railway.app (Recomendado)

1. Acessar [railway.app](https://railway.app)
2. Clicar "New Project" → "Deploy from GitHub"
3. Selecionar repositório
4. Root Directory: `backend`
5. Environment Variables:
   ```
   DATABASE_URL=postgresql://postgres:7820@Mdavel@db.dfezipycqsgxwdrfowrb.supabase.co:5432/postgres
   JWT_SECRET=SuaSenhaSegura123!@
   NODE_ENV=production
   PORT=3000
   ```
6. Deploy automático após commit

##### Opção B2: Heroku

```bash
# Instalar Heroku CLI
heroku login
heroku create siga-secult-backend
heroku config:set DATABASE_URL="postgresql://..."
heroku config:set JWT_SECRET="SuaSenha123!@"
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

##### Opção B3: Azure App Service

1. Criar App Service no Azure Portal
2. Conectar repositório GitHub
3. Configurar Build > Build Automation
4. Adicionar Application Settings (variáveis de ambiente)
5. Deploy automático

---

## PASSO 6: ATUALIZAR SCHEMA PRISMA (SE NECESSÁRIO)

Se modificar o banco de dados via SQL editor do Supabase:

```bash
cd backend
npx prisma db pull     # Atualiza schema.prisma com změny
npx prisma generate   # Regenera Prisma Client
```

---

## PASSO 7: MIGRAÇÕES COM PRISMA

### 7.1 Se adicionar novos models no Prisma:

```bash
cd backend

# DESENVOLVIMENTO
npx prisma migrate dev --name descricao_migracao

# PRODUÇÃO (via Supabase SQL Editor)
# Copiar arquivo de migração gerado e executar no Supabase
```

---

## PASSO 8: SEED DE DADOS (OPCIONAL)

```bash
cd backend

# Criar usuário admin inicial
npx prisma db seed
```

---

## COMANDOS ÚTEIS

### Backend

```bash
# Desenvolvimento
npm run dev              # Inicia com nodemon

# Produção
npm start               # Inicia sem hot-reload

# Prisma
npm run prisma:generate # Regenera cliente
npm run prisma:migrate  # Executa migração
npm run prisma:studio   # Abre Prisma Studio
npm run prisma:seed     # Executa seed

# Testes
npm run test:api        # Testes de API
```

### Frontend

```bash
# Desenvolvimento
npm run dev             # Vite dev server

# Produção
npm run build           # Build otimizado
npm run preview         # Preview da build

# Testes
npm run test:e2e        # Testes end-to-end
npm run test:ui         # Teste UI
```

---

## TROUBLESHOOTING

### Erro: "CONNECTION_REFUSED"

**Solução:**
1. Verificar DATABASE_URL em `.env`
2. Verificar se certificado SSL está configurado
3. Testar conexão:
```bash
psql "postgresql://postgres:7820@Mdavel@db.dfezipycqsgxwdrfowrb.supabase.co:5432/postgres"
```

### Erro: "ENOENT: no such file or directory, open 'uploads'"

**Solução:**
```bash
# Backend: criar diretório
mkdir -p backend/uploads
```

### Frontend não conecta com Backend

**Solução:**
1. Verificar `VITE_API_URL` em `.env`
2. Verificar CORS no `backend/src/server.js`
3. Checar console do navegador para mensagens de erro

### Migrations não aplicadas no Supabase

**Solução:**
1. Executar script `SUPABASE_SCHEMA.sql` diretamente no SQL Editor
2. Ou usar Prisma:
```bash
npx prisma migrate deploy
```

---

## CHECKLIST PRÉ-PRODUÇÃO

- [ ] `.env` configurado com credenciais reais
- [ ] Todas as tabelas criadas no Supabase
- [ ] Backend testado localmente (`npm run dev`)
- [ ] Frontend testado localmente (`npm run dev`)
- [ ] Build frontend testado (`npm run build`)
- [ ] Git repository criado e enviado
- [ ] Variáveis de ambiente configuradas em Vercel/Railway
- [ ] JWT_SECRET alterado para valor seguro
- [ ] CORS configurado corretamente
- [ ] SSL/TLS ativado no Supabase (automático)
- [ ] Backups configurados no Supabase
- [ ] Domínio customizado apontando para Vercel (se aplicável)

---

## MONITORAMENTO PÓS-DEPLOYMENT

### Acessar Logs

**Frontend (Vercel):**
- Dashboard Vercel → Project → Deployments → View logs

**Backend (Railway/Heroku):**
- Railway: Dashboard → Service → Logs
- Heroku: `heroku logs --tail`

### Métricas

**Supabase:**
- Dashboard → Logs → Database
- Dashboard → Monitor → Performance

---

## CONTATO E SUPORTE

Para erros específicos:
1. Verificar logs (veja seção "Acessar Logs")
2. Consultar documentação:
   - [Supabase Docs](https://supabase.com/docs)
   - [Vercel Docs](https://vercel.com/docs)
   - [Prisma Docs](https://www.prisma.io/docs)
   - [Vite Docs](https://vitejs.dev/guide)

---

## PRÓXIMOS PASSOS

1. Implementar GitHub Actions para CI/CD
2. Adicionar testes automatizados
3. Configurar alertas de monitoramento
4. Implementar backup automático
5. Configurar domínio customizado
6. Adicionar certificado SSL customizado
