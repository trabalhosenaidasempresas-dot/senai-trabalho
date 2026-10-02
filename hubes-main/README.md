# SIGA Secult - Sistema Integrado de Gestão Administrativa

## Visão Geral

SIGA Secult é um sistema web completo para centralizar a gestão administrativa da Secult/HUB ES+, substituindo controles feitos em Excel, Word, WhatsApp e e-mails por uma plataforma integrada profissional.

## 🏗️ Arquitetura

O projeto segue rigorosamente o padrão **MVC (Model-View-Controller)** com separação clara de responsabilidades.

### Backend (Node.js + Express)
- **controllers/**: Lógica de requisição/resposta
- **services/**: Lógica de negócio
- **repositories/**: Acesso a dados
- **models/**: Definições de dados
- **middlewares/**: Autenticação e autorização
- **utils/**: Funções auxiliares
- **config/**: Configurações

### Frontend (React)
- **pages/**: Páginas principais
- **components/**: Componentes reutilizáveis
- **contexts/**: Context API para estado global
- **layouts/**: Layouts principais
- **services/**: Chamadas de API
- **assets/**: Imagens e arquivos estáticos

## 🚀 Instalação e Setup

### Backend

1. Configure o arquivo `.env`:
```bash
cd backend
cp .env.example .env
# Editar .env com suas configurações
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados PostgreSQL:
```bash
# Criar migration do Prisma
npm run prisma:migrate

# Executar seed (usuários padrão)
npm run prisma:seed
```

4. Inicie o servidor:
```bash
npm run dev
```

O backend estará disponível em `http://localhost:3000`

### Frontend

1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Inicie o desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3001`

## 👥 Usuários Padrão

Criados automaticamente pelo seed:

| Email | Senha | Perfil |
|-------|-------|--------|
| admin@secult.com | admin123 | Administrador |
| gestor@secult.com | gestor123 | Gestor |
| servidor@secult.com | servidor123 | Servidor |

## 📋 Módulos Implementados

### ✅ Autenticação
- Login com JWT
- Refresh token
- Controle de perfis e permissões

### ✅ Usuários
- CRUD completo
- Upload de foto
- Paginação

### 🔄 Em Desenvolvimento
- Gestão Documental
- Controle de Compras
- Estoque
- Agenda
- Ocorrências
- Comunicação
- Indicadores

## 🔐 Segurança

- Autenticação JWT
- Criptografia bcrypt
- Middleware de autenticação
- Controle de permissões por perfil
- Validação de entrada

## 📊 Tecnologias

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt

### Frontend
- React 18
- Material-UI
- React Router
- Axios
- React Hook Form
- Vite

## 📂 Estrutura de Pastas

```
projeto01/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── config/
│   │   ├── utils/
│   │   ├── uploads/
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token

### Usuários
- `GET /api/usuarios` - Listar usuários
- `GET /api/usuarios/:id` - Obter usuário
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Deletar usuário
- `POST /api/usuarios/:id/foto` - Upload de foto

### Outros módulos
- `/api/documentos` - Em desenvolvimento
- `/api/compras` - Em desenvolvimento
- `/api/estoque` - Em desenvolvimento
- `/api/agenda` - Em desenvolvimento
- `/api/ocorrencias` - Em desenvolvimento
- `/api/comunicacao` - Em desenvolvimento

## 📝 Próximas Funcionalidades

1. **Gestão Documental**: Upload, versionamento e histórico
2. **Compras**: Fluxo completo de solicitação a entrega
3. **Estoque**: Movimentação e alertas
4. **Agenda**: Calendário e reservas
5. **Ocorrências**: Registro e acompanhamento
6. **Comunicação**: Avisos e mensagens
7. **Indicadores**: Dashboard analítico

## 💡 Principais Padrões de Código

- Repository Pattern
- Service Layer
- MVC Architecture
- JWT Authentication
- Clean Code principles
- SOLID principles

## 📄 Licença

ISC

## 👨‍💻 Autor

Desenvolvido com as melhores práticas do ecossistema React + Node.js + Express + PostgreSQL.
