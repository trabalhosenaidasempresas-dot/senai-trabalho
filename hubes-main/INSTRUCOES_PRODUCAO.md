# Instruções de Produção - SIGA Secult

## 🚀 EXECUTAR EM PRODUÇÃO

### Opção 1: Localmente (Teste Final)

```bash
# Terminal 1: Backend
cd backend
NODE_ENV=production npm run prisma:generate
NODE_ENV=production npm start

# Terminal 2: Frontend
cd frontend
npm run build
npm run preview
```

### Opção 2: Vercel + Railway (Cloud - Recomendado)

#### A. Preparar Repositório Git

```bash
# No diretório raiz do projeto
git init
git add .
git commit -m "SIGA Secult - Supabase + Vercel"
git remote add origin https://github.com/seu-usuario/siga-secult.git
git push -u origin main
```

#### B. Deploy Frontend no Vercel

1. Ir para https://vercel.com
2. Clicar "New Project"
3. Importar Repository GitHub
4. Configurar:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `dist`
5. Environment Variables:
   ```
   VITE_API_URL=https://seu-backend-prod.com
   VITE_SUPABASE_URL=https://dfezipycqsgxwdrfowrb.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
6. Deploy

#### C. Deploy Backend no Railway

1. Ir para https://railway.app
2. Clicar "New Project"
3. Selecionar "Deploy from GitHub"
4. Conectar repositório
5. Configurar:
   - Root Directory: `backend`
   - Start Command: `npm start`
6. Environment Variables:
   ```
   DATABASE_URL=postgresql://postgres:7820@Mdavel@db.dfezipycqsgxwdrfowrb.supabase.co:5432/postgres
   JWT_SECRET=YourSuperSecurePasswordHere123!@#
   NODE_ENV=production
   PORT=3000
   ```
7. Deploy (automático após commit no GitHub)

### Opção 3: Docker (Self-Hosted)

```bash
# Backend
cd backend
docker build -t siga-backend .
docker run -e DATABASE_URL=... -p 3000:3000 siga-backend

# Frontend
cd frontend
docker build -t siga-frontend .
docker run -p 80:3000 siga-frontend
```

---

## 📦 Instalação de Dependências

### Backend
```bash
cd backend
npm install
npm run prisma:generate
```

### Frontend
```bash
cd frontend
npm install
npm run build
```

---

## ⚙️ Variáveis de Ambiente Necessárias

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:7820@Mdavel@db.dfezipycqsgxwdrfowrb.supabase.co:5432/postgres"
SUPABASE_URL="https://dfezipycqsgxwdrfowrb.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
JWT_SECRET="SuaSenhaSeguraAqui123!@#"
JWT_EXPIRE="24h"
JWT_REFRESH_EXPIRE="7d"
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=60
PORT=3000
NODE_ENV="production"
API_URL="https://seu-backend-prod.com"
```

### Frontend (.env.production)
```env
VITE_API_URL=https://seu-backend-prod.com
VITE_SUPABASE_URL=https://dfezipycqsgxwdrfowrb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔄 Fluxo de Deployment

```
1. Develop Localmente
   └─> npm run dev (backend + frontend)

2. Commit e Push no GitHub
   └─> git add . && git commit -m "msg" && git push

3. Vercel Auto-Deploy Frontend
   └─> Builds automaticamente após push

4. Railway Auto-Deploy Backend  
   └─> Builds automaticamente após push

5. Monitor em Produção
   └─> Vercel Dashboard
   └─> Railway Dashboard
   └─> Supabase Logs
```

---

## 📊 Monitoramento em Produção

### Verificar Saúde da API
```bash
curl https://seu-backend-prod.com/api/health
# Deve retornar:
# {"success":true,"message":"SIGA Secult Backend está rodando!"}
```

### Logs Vercel
- Dashboard → Project → Deployments → Logs

### Logs Railway
- Dashboard → Service → Logs

### Logs Supabase
- Console → Logs → Database
- Console → Monitor → Performance

---

## 🔐 Checklist de Segurança Produção

- [ ] JWT_SECRET alterado (mínimo 32 caracteres)
- [ ] DATABASE_URL com credenciais seguras
- [ ] Variáveis de ambiente não commitadas (no .env local)
- [ ] .gitignore contém `.env`
- [ ] CORS configurado para domínios específicos
- [ ] Rate limiting configurado (se necessário)
- [ ] HTTPS habilitado (automático Vercel/Railway)
- [ ] Backups Supabase habilitados
- [ ] Monitoramento ativado

---

## 🛠️ Comandos de Manutenção

### Verificar Status
```bash
# Backend Health
curl http://localhost:3000/api/health

# Logs em tempo real
npm run logs  # (configure em package.json se necessário)
```

### Atualizar Dependências
```bash
cd backend
npm update
npm audit fix

cd ../frontend
npm update
npm audit fix
```

### Limpar Cache/Build
```bash
# Backend
rm -rf node_modules
npm install
npm run prisma:generate

# Frontend
rm -rf node_modules dist
npm install
npm run build
```

### Redeployar Manualmente

**Vercel:**
```bash
# Fazer commit e push
git push origin main
# Automático em ~1 minuto
```

**Railway:**
```bash
# Fazer commit e push
git push origin main
# Automático em ~2-3 minutos
```

---

## 🐛 Troubleshooting Produção

### Erro: Database Connection Timeout
```bash
# Verificar CONNECTION STRING
echo $DATABASE_URL

# Testar conexão
psql "$DATABASE_URL"

# Adicionar timeout no .env
DATABASE_URL="...?sslmode=require&connect_timeout=10"
```

### Erro: Port Already in Use
```bash
# Mudar porta em .env
PORT=3001

# Ou liberar porta (Linux/Mac)
lsof -i :3000
kill -9 <PID>
```

### Erro: CORS/CORS Policy
```bash
# Verificar CORS em backend/src/server.js
app.use(cors({
  origin: ['https://seu-frontend.vercel.app'],
  credentials: true
}));
```

### Erro: Build Falha no Vercel
```bash
# Verificar logs Vercel
# Comum: Variáveis de ambiente não configuradas
# Solução: Adicionar em Vercel Project Settings > Environment Variables
```

---

## 📈 Performance em Produção

### Otimizações Habilitadas

- [x] Frontend: Code Splitting (Vite)
- [x] Frontend: Minification
- [x] Frontend: Tree Shaking
- [x] Backend: Compression Middleware
- [x] Database: Indexing (veja SUPABASE_SCHEMA.sql)
- [x] SSL/TLS: Habilitado Supabase

### Melhorias Recomendadas

1. **Cache**: Adicionar Redis para sessões
2. **CDN**: Ativar Vercel Edge Networks
3. **Monitoring**: New Relic / DataDog
4. **Backup**: Automotivo Supabase
5. **Auto-scaling**: Railway auto-scaling

---

## 📞 Suporte Rápido

| Problema | Solução |
|----------|---------|
| "Cannot find module" | `npm install` |
| "Port in use" | Mudar PORT em .env |
| "Database error" | Verificar DATABASE_URL |
| "CORS error" | Adicionar origem em middleware |
| "Build fails" | Verificar environment variables |
| "Slow queries" | Adicionar index ao banco |
| "Out of memory" | Aumentar Node heap size |

---

## 🎯 Próximos Passos

1. ✅ Instalar dependências
2. ✅ Testar localmente
3. ✅ Fazer push para GitHub
4. ✅ Deploy Vercel
5. ✅ Deploy Railway
6. ✅ Configurar Domínio
7. ✅ Ativar SSL Customizado
8. ✅ Configurar Monitoring

---

**Status:** Ready for Production 🚀
**Última Atualização:** 19/08/2026
