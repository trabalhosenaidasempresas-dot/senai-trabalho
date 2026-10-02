# ❓ FAQ - Perguntas Frequentes

## 🚀 Setup e Instalação

### P: Como instalar o projeto?
**R:** 
- **Windows**: Abra terminal em `projeto01/` e execute `install.bat`
- **Linux/Mac**: Abra terminal e execute `bash install.sh`
- Ou siga manualmente: `cd backend && npm install` e `cd frontend && npm install`

### P: Qual versão do Node.js é necessária?
**R:** Node.js 16+. Recomendado: 18+. Verifique com `node --version`

### P: Como configurar as variáveis de ambiente?
**R:** 
1. Na pasta `backend/`, copie `.env.example` para `.env`
2. Edite `.env` com suas credenciais PostgreSQL
3. Exemplo:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/siga_secult"
JWT_SECRET="sua_chave_bem_segura"
PORT=3000
```

### P: Preciso de PostgreSQL instalado?
**R:** Sim, ou use Docker: `docker-compose up -d` (cria automaticamente)

### P: Como criar as tabelas do banco de dados?
**R:** Execute em `backend/`:
```bash
npm run prisma:migrate
npm run prisma:seed
```

---

## 💻 Desenvolvimento

### P: Como iniciar o servidor de desenvolvimento?

**R:** Em dois terminais separados:

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### P: Qual porta o frontend usa?
**R:** 3001 (http://localhost:3001)

### P: Qual porta o backend usa?
**R:** 3000 (http://localhost:3000)

### P: O frontend consegue acessar o backend?
**R:** Sim! Vite está configurado com proxy em `/api` → `http://localhost:3000`

### P: Como fazer login na aplicação?
**R:** Use as credenciais padrão:
- Email: `admin@secult.com`
- Senha: `admin123`

### P: Onde vejo os logs do servidor?
**R:** No terminal onde executou `npm run dev`. Erros aparecem em tempo real.

### P: Como adicionar um novo usuário?
**R:** 
1. Acesse a página de Usuários
2. Clique em "Novo Usuário"
3. Preencha o formulário
4. Clique em Salvar

### P: Como fazer upload de foto?
**R:** Na tabela de usuários, clique no ícone de editar e adicione uma foto. As fotos são armazenadas em `backend/src/uploads/`

---

## 🗄️ Banco de Dados

### P: Onde estão os dados do banco?
**R:** No PostgreSQL em `localhost:5432` (padrão)

### P: Como acessar o banco de dados?
**R:** 
```bash
# Opção 1: Prisma Studio
npm run prisma:studio

# Opção 2: psql
psql -U siga_user -d siga_secult
```

### P: Posso resetar o banco de dados?
**R:** Sim, com cuidado:
```bash
npm run prisma:migrate reset
```
Isso vai apagar tudo e recriar as tabelas!

### P: Como adicionar uma nova tabela?
**R:** 
1. Edite `backend/prisma/schema.prisma`
2. Defina o modelo
3. Execute: `npm run prisma:migrate dev`

### P: O banco de dados tem dados de teste?
**R:** Sim! Execute `npm run prisma:seed` para popular com usuários padrão

---

## 🔐 Autenticação e Permissões

### P: Como funciona o sistema de login?
**R:** 
1. Usuário entra email e senha
2. Backend verifica credenciais
3. Se válido, gera JWT token
4. Token é armazenado no localStorage
5. Token é enviado em cada requisição

### P: Como o token é enviado nas requisições?
**R:** 
```
Authorization: Bearer {token}
```
Axios configura automaticamente isso.

### P: Quanto tempo o token dura?
**R:** 24 horas (configurável em `.env` via `JWT_EXPIRE`)

### P: O token expira, o que fazer?
**R:** Há endpoint de refresh: `POST /api/auth/refresh`
O frontend pode fazer isso automaticamente.

### P: Quais são os perfis disponíveis?
**R:** 
- Administrador (acesso total)
- Gestor (acesso a módulos principais)
- Servidor (acesso limitado)
- Visitante (apenas visualização)

### P: Como mudar o perfil de um usuário?
**R:** Na página de Usuários, edite o usuário e mude o perfil no dropdown.

### P: Posso criar um novo perfil?
**R:** Ainda não está implementado. Edite `backend/prisma/schema.prisma` se precisar.

---

## 🏗️ Arquitetura

### P: Por que MVC?
**R:** Padrão reconhecido, fácil de manter, escalável para novos módulos.

### P: O que é Repository Pattern?
**R:** Abstração de acesso a dados. Toda interação com BD passa por `repositories/`.

### P: O que faz o Service Layer?
**R:** Contém toda lógica de negócio. Controllers chamam services que chamam repositories.

### P: Como adicionar um novo módulo?
**R:** 
1. Crie a tabela em `prisma/schema.prisma`
2. Crie `controllers/`, `services/`, `repositories/`
3. Crie as rotas em `routes/`
4. Implemente os endpoints
5. Crie componentes React no frontend

---

## 🐳 Docker

### P: Como usar Docker?
**R:** 
```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f
```

### P: Preciso instalar PostgreSQL se usar Docker?
**R:** Não! Docker cria um container PostgreSQL automaticamente.

### P: Como acessar o banco de dados no Docker?
**R:** 
```bash
docker exec -it siga_secult_db psql -U siga_user -d siga_secult
```

### P: Posso usar Docker em produção?
**R:** Sim! É recomendado. Edite `docker-compose.yml` para produção.

---

## ⚠️ Erros Comuns

### P: "Cannot find module '@prisma/client'"
**R:** Execute `npm install` na pasta backend

### P: "Porta 3000 já está em uso"
**R:** 
- Feche o outro processo usando a porta
- Ou mude a PORT no `.env`

### P: "Connection refused"
**R:** PostgreSQL não está rodando. Inicie-o ou use Docker.

### P: "Token inválido"
**R:** Token pode estar expirado. Faça login novamente.

### P: "CORS error"
**R:** Backend não está rodando ou configuração CORS está errada.

### P: "Arquivo não foi salvo"
**R:** Verifique permissões da pasta `backend/src/uploads/`

### P: Frontend não conecta ao backend
**R:** 
- Verifique se backend está rodando em http://localhost:3000
- Verifique proxy em `frontend/vite.config.js`

---

## 📊 Funcionalidades

### P: Quais funcionalidades estão prontas?
**R:** 
- ✅ Autenticação (login, token, refresh)
- ✅ Gestão de usuários (CRUD)
- ✅ Upload de fotos
- ✅ Dashboard básico
- ✅ Controle de permissões

### P: Quais funcionalidades estão em desenvolvimento?
**R:** 
- 🔄 Gestão de Documentos
- 🔄 Controle de Compras
- 🔄 Estoque
- 🔄 Agenda
- 🔄 Ocorrências
- 🔄 Comunicação
- 🔄 Indicadores

### P: Como contribuir com novas funcionalidades?
**R:** Veja ROADMAP.md para o plano. Siga o padrão MVC existente.

---

## 📚 Documentação

### P: Onde está a documentação?
**R:** 
- README.md - Visão geral
- ESTRUTURA.md - Organização
- ROADMAP.md - Próximas fases
- TESTES.md - Como testar
- DOCKER.md - Docker
- CHECKLIST.md - Validação
- FAQ.md - Este arquivo

### P: Como ler o código?
**R:** 
1. Comece por `backend/src/server.js` (entry point)
2. Veja as rotas
3. Acompanhe controllers → services → repositories

### P: Há exemplos de código?
**R:** Sim! Veja usuarioController.js como exemplo completo de CRUD.

---

## 🧪 Testes

### P: Como testar a API?
**R:** Use Postman, Insomnia ou curl. Veja TESTES.md

### P: Como testar o frontend?
**R:** Abra http://localhost:3001 e navegue

### P: Há testes automatizados?
**R:** Não na versão MVP. Será adicionado em fases futuras.

### P: Como testar permissões?
**R:** Crie usuários com perfis diferentes e faça login com cada um.

---

## 🚢 Deploy

### P: Como colocar em produção?
**R:** 
1. Use Docker: `docker-compose -f docker-compose.yml up -d`
2. Configure `.env` com valores de produção
3. Use HTTPS
4. Configure backup do BD
5. Implemente monitoramento

### P: Onde posso fazer deploy?
**R:** Heroku, AWS, Digital Ocean, Azure, etc. Todos suportam Docker.

### P: Como migrar dados para produção?
**R:** Use Prisma: `npm run prisma:migrate -- --skip-generate`

### P: Preciso de CI/CD?
**R:** Recomendado. Use GitHub Actions, GitLab CI ou Jenkins.

---

## 💡 Dúvidas Gerais

### P: Posso usar outro banco de dados?
**R:** Sim! Prisma suporta MySQL, MongoDB, etc. Edite `DATABASE_URL` em `.env`

### P: Posso remover Material-UI?
**R:** Sim, mas terá que reescrever a interface. Use outro framework como Bootstrap.

### P: O projeto é seguro?
**R:** Tem proteções básicas. Em produção, adicione:
- Rate limiting
- HTTPS
- Secrets seguros
- Logs de auditoria
- Backup automático

### P: Posso comercializar esse código?
**R:** Sim! É código seu. ISC License permite uso comercial.

### P: Como contribuir melhorias?
**R:** Abra um Pull Request com suas mudanças. Siga o padrão de código existente.

### P: Há suporte técnico?
**R:** Consulte a documentação. Para bugs, abra uma issue no Git.

---

## 📞 Contato

Dúvidas não respondidas aqui?
- Consulte ESTRUTURA.md
- Veja exemplos em usuarioController.js
- Leia TESTES.md para validações

---

**Última atualização**: 2024
**Versão**: 1.0.0
