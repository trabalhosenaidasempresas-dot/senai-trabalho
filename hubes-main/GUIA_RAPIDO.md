# 🚀 GUIA RÁPIDO - SIGA SECULT

## ⏱️ 5 Minutos para Começar

### 1️⃣ Instalação (3 minutos)
```bash
# Windows
cd projeto01
install.bat

# Linux/Mac
bash install.sh

# Ou manualmente
cd backend && npm install && cd ../frontend && npm install
```

### 2️⃣ Configuração (1 minuto)
Editar `backend/.env`:
```env
DATABASE_URL="postgresql://siga_user:siga_password@localhost:5432/siga_secult"
JWT_SECRET="sua_chave_secreta"
```

### 3️⃣ Iniciar (1 minuto)
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 4️⃣ Acessar
- 🌐 http://localhost:3001
- 📧 admin@secult.com
- 🔑 admin123

---

## 📊 O QUE VOCÊ TEM

✅ Backend profissional (Node.js + Express + Prisma)
✅ Frontend moderno (React + Material-UI)
✅ Autenticação JWT completa
✅ CRUD de usuários funcional
✅ Dashboard com estatísticas
✅ PostgreSQL pronto
✅ Docker configurado
✅ Documentação extensiva

---

## 📁 Arquivos Importantes

| Arquivo | Para Quê |
|---------|----------|
| README.md | Início - Leia primeiro |
| ESTRUTURA.md | Entender a organização |
| TESTES.md | Como testar |
| ROADMAP.md | Próximas funcionalidades |
| FAQ.md | Respostas rápidas |

---

## 🔥 Comandos Essenciais

### Backend
```bash
npm run dev                # Desenvolvimento
npm run prisma:migrate     # Criar tabelas
npm run prisma:seed        # Dados de teste
npm run prisma:studio      # Visualizar BD
```

### Frontend
```bash
npm run dev                # Desenvolvimento
npm run build              # Produção
npm run preview            # Preview
```

### Docker (Alternativa)
```bash
docker-compose up -d       # Iniciar
docker-compose down        # Parar
docker-compose logs -f     # Ver logs
```

---

## 🎯 Próximas Ações

1. ✅ Clonar/extrair projeto
2. ✅ Executar `install.bat` ou `install.sh`
3. ✅ Editar `.env` com BD
4. ✅ `npm run dev` em backend/
5. ✅ `npm run dev` em frontend/
6. ✅ Acessar http://localhost:3001
7. ⏭️ Ler README.md para mais detalhes

---

## ❓ Dúvidas?

- 📖 Leia **README.md**
- ❓ Veja **FAQ.md**
- 🗂️ Confira **ESTRUTURA.md**
- 🧪 Siga **TESTES.md**

---

## 📞 Estrutura de Pastas

```
projeto01/
├── backend/      (Node.js + Express)
├── frontend/     (React)
├── README.md     ← Comece aqui
├── FAQ.md        ← Perguntas?
└── ESTRUTURA.md  ← Dúvidas de organização?
```

---

**Versão**: 1.0.0
**Status**: ✅ Pronto

Boa sorte! 🚀
