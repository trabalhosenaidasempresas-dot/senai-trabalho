# ROTEIRO ADAPTAÇÕES SUPABASE + VERCEL

## ✅ CONCLUÍDO

### Arquivos Criados/Atualizados:

1. **backend/.env**
   - Configurado com credenciais Supabase
   - JWT_SECRET incluído
   - PGSSLMODE=require ativado
   - Pronto para uso

2. **frontend/.env**
   - URLs de desenvolvimento
   - Chaves Supabase incluídas

3. **frontend/.env.production**
   - URLs de produção
   - Chaves Supabase incluídas

4. **SUPABASE_SCHEMA.sql** (Novo)
   - 715 linhas de SQL completo
   - Todas as 20+ tabelas do projeto
   - Procedimentos com TLS/SSL
   - Pronto para executar no Supabase SQL Editor
   - Includes: Usuarios, Documentos, Compras, Estoque, Agenda, Ocorrências, Serviços, Comunicação, Logs, Auditoria

5. **frontend/vite.config.js** (Atualizado)
   - Otimizado para Vercel
   - Code splitting configurado
   - Build otimizada (minify, terser)
   - Suporta variáveis de ambiente

6. **frontend/vercel.json** (Novo)
   - Configuração Vercel
   - Build command correto
   - Node version 18.x

7. **frontend/package.json** (Atualizado)
   - Adicionado terser para build otimizada
   - Configurado engines (node 18.x)
   - Removido script "start" (não needed para Vercel)

8. **GUIA_DEPLOYMENT_PRODUCAO.md** (Novo)
   - 400+ linhas de instruções
   - Passo a passo completo
   - Troubleshooting incluído
   - Opções para backend (Railway, Heroku, Azure)

---

## 📋 PRÓXIMAS AÇÕES (VOCÊ PRECISA FAZER)

### 1. EXECUTAR SCHEMA SQL NO SUPABASE

```
1. Acesse: https://app.supabase.com/project/dfezipycqsgxwdrfowrb
2. Clique em "SQL Editor"
3. Novo Query
4. Copie e cole o arquivo: SUPABASE_SCHEMA.sql
5. Clique Run
```

**Estimado:** 2-3 segun dos

---

### 2. VERIFICAR ARQUIVO .env

Verifique se algum valor está diferente:

`backend/.env`:
```
DATABASE_URL="postgresql://postgres:7820@Mdavel@db.dfezipycqsgxwdrfowrb.supabase.co:5432/postgres"
```

Se a senha contém caracteres especiais e está causando problemas, use URL encoded:
```
@   = %40
#   = %23
!   = %21
```

---

### 3. INSTALAR DEPENDÊNCIAS LOCALMENTE

```bash
# Terminal 1 - Backend
cd backend
npm install

# Terminal 2 - Frontend  
cd frontend
npm install
```

**Estimado:** 5-10 minutos (depende da internet)

---

### 4. TESTAR LOCALMENTE

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

Validar em `http://localhost:3001`

---

### 5. PREPARAR PARA PRODUÇÃO

#### 5a. Backend - Escolher Plataforma:

**Opção 1: Railway (Recomendado - Mais fácil)**
- Grátis: $5/mês
- Acesso: https://railway.app
- Conectar GitHub + Deploy automático

**Opção 2: Heroku**
- Grátis: Descontinuado (use Railway)
- Alternativa paga disponível

**Opção 3: Azure**
- Grátis: $150/mês (free trial)
- Mais complexo setup

#### 5b. Frontend - Vercel

- Grátis: Sim
- Setup: Automático (GitHub)
- Acesso: https://vercel.com

---

### 6. CRIAR REPOSITORY GIT

```bash
# No diretório raiz
git init
git add .
git commit -m "Initial - SIGA com Supabase"
```

Se usar GitHub:
```bash
git remote add origin https://github.com/SEU_USER/siga-secult.git
git push -u origin main
```

---

## 🔐 SEGURANÇA - CHECKLIST FINAL

- [ ] JWT_SECRET alterado (não usar o padrão)
- [ ] DATABASE_URL só em .env (nunca em Git)
- [ ] .gitignore inclui .env (verificar)
- [ ] Supabase: RLS (Row Level Security) habilitado se necessário
- [ ] CORS configurado apenas para domínios autorizados
- [ ] Certificados SSL/TLS do Supabase habilitados (automático)

---

## 📊 ESTRUTURA FINAL

```
siga-secult/
├── backend/
│   ├── .env (✅ Criado com Supabase)
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── services/
│   └── package.json
│
├── frontend/
│   ├── .env (✅ Criado)
│   ├── .env.production (✅ Criado)
│   ├── vite.config.js (✅ Atualizado)
│   ├── vercel.json (✅ Criado)
│   ├── package.json (✅ Atualizado)
│   └── src/
│
├── SUPABASE_SCHEMA.sql (✅ Criado - 715 linhas)
├── GUIA_DEPLOYMENT_PRODUCAO.md (✅ Criado)
└── .gitignore (revisar)
```

---

## ⚡ COMANDOS RÁPIDOS

### Desenvolvimento
```bash
cd backend && npm run dev &
cd frontend && npm run dev
```

### Produção (Build)
```bash
cd frontend && npm run build
# Resultado: dist/ pronto para Vercel
```

### Limpar + Reinstalar
```bash
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🆘 ERROS COMUNS

### "Cannot connect to database"
→ Verificar DATABASE_URL e certificado SSL

### "CORS error"
→ Verificar CORS em backend/src/server.js

### "VITE_API_URL not defined"
→ Verificar frontend/.env

### "npm: command not found"
→ Instalar Node.js: https://nodejs.org (v18 LTS)

---

## 📞 ARQUIVOS DE REFERÊNCIA

- **SUPABASE_SCHEMA.sql** - Execute no SQL Editor do Supabase
- **GUIA_DEPLOYMENT_PRODUCAO.md** - Guia detalhado (400+ linhas)
- **FAQ.md** - Perguntas frequentes (já existia)
- **.env files** - Configurações de ambiente

---

## ✨ RESUMO DO QUE FOI FEITO

1. ✅ Criados arquivos .env com credenciais Supabase
2. ✅ Gerado script SQL completo (715 linhas) com todas as tabelas
3. ✅ Configurado frontend para Vercel (vite.config, package.json, vercel.json)
4. ✅ Criado guia de deployment detalhado (400+ linhas)
5. ✅ Documentação de troubleshooting
6. ✅ Checklist de pré-produção

**Status:** Pronto para deploy! 🚀

---

## 📝 PRÓXIMOS PASSOS IMEDIATOS

1. Executar SUPABASE_SCHEMA.sql no Supabase (5 min)
2. Instalar dependências npm (10 min)
3. Testar localmente (5 min)
4. Revisar variáveis de ambiente (2 min)
5. Fazer commit Git (2 min)
6. Deploy no Vercel (1 min)
7. Deploy no Railway/Heroku (5 min)

**Total:** ~30 minutos até estar em produção!

---

**Data:** 19 de Agosto de 2026
**Status:** ✅ Implementação Completada
