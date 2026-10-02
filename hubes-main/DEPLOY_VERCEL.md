# Deploy SIGA Secult no Vercel (Frontend + Backend Serverless)

## 🚀 Arquitetura

- **Frontend**: React + Vite (estático)
- **Backend**: Express como Serverless Functions
- **Banco de Dados**: Supabase PostgreSQL
- **Plataforma**: Vercel (tudo integrado)

---

## 📋 Requisitos

1. Conta no **Vercel** (vercel.com)
2. Projeto no GitHub (já feito: https://github.com/mauriciodavel-docente/hubes)
3. Variáveis de ambiente do Supabase

---

## 🔧 Passo 1: Variáveis de Ambiente no Vercel

No painel do Vercel, configure as seguintes variáveis:

**Settings → Environment Variables**

### Frontend (.env produção):
```
VITE_API_URL=https://seu-projeto.vercel.app/api
VITE_SUPABASE_URL=https://dfezipycqsgxwdrfowrb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZXppcHljcXNneHdkcmZvd3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxODAzNzYsImV4cCI6MjEwMjc1NjM3Nn0.tHeZONB_C0BudDPHKa29Hoad_RqTNrxKspVJNdW-ckU
```

### Backend (produção):
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:7820@Mdavel@db.dfezipycqsgxwdrfowrb.supabase.co:5432/postgres
SUPABASE_URL=https://dfezipycqsgxwdrfowrb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZXppcHljcXNneHdkcmZvd3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxODAzNzYsImV4cCI6MjEwMjc1NjM3Nn0.tHeZONB_C0BudDPHKa29Hoad_RqTNrxKspVJNdW-ckU
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZXppcHljcXNneHdkcmZvd3JiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzE4MDM3NiwiZXhwIjoyMTAyNzU2Mzc2fQ.1zpi_et4ohKfTBRu1jDUifuCuGb9FzW0cIQpmhhcyNw
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_mude_em_producao
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=60
PGSSLMODE=require
```

---

## 📡 Passo 2: Conectar GitHub ao Vercel

1. Acesse https://vercel.com/new
2. Selecione "Import Project"
3. Cole: `https://github.com/mauriciodavel-docente/hubes.git`
4. Defina as variáveis de ambiente (Passo 1)
5. Clique em **Deploy**

Ou use a CLI:
```bash
npm install -g vercel
vercel --prod
```

---

## ✅ Passo 3: Verificar Deploy

Após o deploy:

1. **Verificar health do backend:**
   ```
   https://seu-projeto.vercel.app/api/health
   ```
   Deve retornar: `{"success":true,"message":"SIGA Secult Backend está rodando!"}`

2. **Acessar frontend:**
   ```
   https://seu-projeto.vercel.app
   ```

3. **Testar login:**
   - Email: `admin@secult.com`
   - Senha: `admin123`

---

## 🔄 Passo 4: Seed do Banco (primeira vez)

Se for primeira vez, precisa popular o banco com usuários de teste.

**Opção A: Via CLI local**
```bash
cd backend
NODE_ENV=production npm run prisma:seed
```

**Opção B: Via GitHub Actions** (depois adiciona workflow)

---

## 📊 Monitoramento

No painel do Vercel você pode:
- Ver logs das funções serverless
- Monitorar performance
- Verificar deployment status
- Rollback de versões

---

## 🚨 Troubleshooting

**Erro: "Module not found"**
- Verificar se `.env` tem `DATABASE_URL` correto
- Prisma precisa estar gerado: `npm run prisma:generate`

**Erro: "Connection refused"**
- Verificar se Supabase está acessível
- SSL/TLS: `PGSSLMODE=require`

**Erro: "Function timeout"**
- Aumentar timeout em `vercel.json`: `"maxDuration": 60`
- Otimizar queries do Prisma

**Erro: "CORS"**
- Verificar `VITE_API_URL` no frontend `.env.production`
- CORS está ativado no backend

---

## 📝 Comando de Deploy

Após fazer commits no GitHub:
```bash
git add .
git commit -m "feat: updates"
git push origin main
```

Vercel faz deploy automático! 🎉

---

**Dúvidas?** Verifique os logs no painel do Vercel: **Deployments → Logs**
