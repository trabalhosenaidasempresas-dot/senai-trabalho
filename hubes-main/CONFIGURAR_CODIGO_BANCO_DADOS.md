# 🔧 CONFIGURAR CÓDIGO NO BANCO DE DADOS - GUIA COMPLETO

**Objetivo:** Fazer o código funcionar corretamente com as permissões no banco PostgreSQL

**Tempo:** 10 minutos  
**Dificuldade:** ⭐ Muito fácil

---

## 📊 COMO O CÓDIGO ESTÁ CONFIGURADO

### 1️⃣ Frontend (React)

**Arquivo:** `frontend/src/pages/LoginPage.jsx`

```javascript
// Faz login e recebe JWT
const response = await axios.post('/api/auth/login', {
  email: email,
  senha: senha
});

// Salva token
localStorage.setItem('token', response.data.token);

// Usa token em requisições
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

**Resultado:**
- ✅ Faz login
- ✅ Recebe JWT token
- ✅ Envia token em requisições

### 2️⃣ Backend (Node.js)

**Arquivo:** `backend/src/middleware/auth.js`

```javascript
// Verifica JWT
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// Verifica RBAC
const permissao = await db.Permissao.findOne({
  where: {
    usuario_id: decoded.id,
    modulo: 'Usuarios',
    acao: 'listar'
  }
});

// Se não tiver permissão → 403
if (!permissao) {
  return res.status(403).json({ message: 'Acesso negado' });
}
```

**Resultado:**
- ✅ Valida JWT
- ✅ Valida permissões (RBAC)
- ✅ Retorna 403 se sem permissão

### 3️⃣ Banco de Dados (PostgreSQL)

**Tabelas:**

```sql
Usuario (id, email, nome, perfil)
  └─ Armazena usuários

Permissao (id, usuario_id, modulo, acao)
  └─ Armazena permissões
  └─ VAZIA AGORA = daí o erro 403!
```

---

## ⚡ PASSO 1: CONCEDER PERMISSÕES

### Opção A: Copiar e Colar (Recomendado)

**Arquivo de referência:** `COPIAR_COLAR_403.md`

1. Abra: http://localhost:8080
2. Login: `siga_user` / `siga_password`
3. Tabela: `Permissao`
4. Novo Registro
5. Copie cada uma das 35 linhas
6. Cole no formulário
7. Salve

**Total:** 35 registros

### Opção B: Script SQL

**Arquivo:** `CONCEDER_PERMISSOES_AUTOMATICO.sql`

1. Abra Adminer → SQL command
2. Cole o script inteiro
3. Execute
4. Pronto!

**Total:** 1 minuto

---

## 📋 O QUE VAI ACONTECER DEPOIS

### Antes (Sem Permissões)

```
User: admin@secult.com
Login: ✅ Sucesso

GET /api/usuarios:
  Backend verifica permissão
  Não encontra registro em "Permissao"
  Retorna: 403 Forbidden ❌
```

### Depois (Com Permissões)

```
User: admin@secult.com
Login: ✅ Sucesso

GET /api/usuarios:
  Backend verifica permissão
  Encontra registro em "Permissao"
  Retorna: 200 OK + dados ✅
```

---

## 🎯 PASSO 2: TESTAR TUDO

### Teste 1: Login Simples

```
1. Abra: http://localhost
2. Email: admin@secult.com
3. Senha: admin123
4. Clique: Entrar
5. Resultado esperado: ✅ Login bem-sucedido
```

### Teste 2: Acessar Módulo

```
1. Após login, ir para: Usuários
2. Clique: Novo Usuário
3. Preencha:
   - Nome: João Silva
   - Email: joao@test.com
   - Senha: 123456
   - Perfil: Servidor
4. Clique: Salvar
5. Resultado esperado: ✅ Aparece na lista
```

### Teste 3: Verificar no Banco

```
1. Abra: http://localhost:8080
2. Tabela: Usuario
3. Procure: joao@test.com
4. Resultado esperado: ✅ Lá está!
```

---

## ✅ COMO SABER QUE ESTÁ FUNCIONANDO

### Verificação 1: Erro 403 Desapareceu

Tenta acessar um módulo:
- ❌ Antes: "Request failed with status code 403"
- ✅ Depois: Carrega normalmente

### Verificação 2: Dados Salvam

Cria um novo usuário:
- ❌ Antes: Erro na requisição
- ✅ Depois: Aparece na lista e no banco

### Verificação 3: Notificações Funcionam

Salva um usuário:
- ❌ Antes: Sem feedback
- ✅ Depois: Toast verde aparece ("Salvo com sucesso!")

---

## 📊 CHECKLIST

```
Preparação:
  [x] Backend rodando
  [x] Frontend rodando
  [x] PostgreSQL rodando
  [x] Arquivos de configuração prontos

Configuração:
  [ ] Conceder 35 permissões ao admin
      └─ Opção A: COPIAR_COLAR_403.md
      └─ Opção B: CONCEDER_PERMISSOES_AUTOMATICO.sql
  [ ] Verificar que tem 35 registros na tabela Permissao

Teste:
  [ ] Fazer login em http://localhost
  [ ] Ir para módulo Usuários
  [ ] Criar novo usuário
  [ ] Verificar se aparece na lista
  [ ] Verificar se salvou no banco

Resultado:
  [ ] Erro 403 sumiu
  [ ] Dados salvam normalmente
  [ ] Notificações funcionam
  [ ] Sistema 100% funcional
```

---

## 🔗 ESTRUTURA DE CÓDIGO CONFIGURADA

### Login Flow

```
Frontend (React)
  ↓
  POST /api/auth/login
  ↓
Backend (Node.js)
  ↓
  Verifica email + senha
  ↓
  Gera JWT token
  ↓
  Retorna token
  ↓
Frontend (React)
  ↓
  Salva token em localStorage
  ↓
  Usa token em requisições
```

### Request Flow com Permissões

```
Frontend (React)
  ↓
  GET /api/usuarios
  Header: Authorization: Bearer [TOKEN]
  ↓
Backend (Node.js)
  ↓
  Middleware: Verifica JWT ✅
  ↓
  Middleware: Verifica permissão em BD
  ↓
  Se tem permissão: Retorna dados ✅
  Se não tem: Retorna 403 ❌
  ↓
Frontend (React)
  ↓
  Se 200: Mostra dados
  Se 403: Mostra erro
```

---

## 💾 BANCO DE DADOS

### Tabela: Usuario

```
id    | email              | nome         | perfil
------|--------------------|--------------|--------------
1     | admin@secult.com   | Admin User   | Administrador
2     | gestor@secult.com  | Gestor User  | Gestor
3     | servidor@secult.com| Servidor User| Servidor
```

### Tabela: Permissao (VAZIA AGORA)

Depois de configurar:

```
id    | usuario_id | modulo     | acao
------|------------|------------|--------
1     | 1          | Usuarios   | listar
2     | 1          | Usuarios   | criar
3     | 1          | Usuarios   | editar
...   | ...        | ...        | ...
35    | 1          | Comunicacao| visualizar
```

---

## 🚀 DEPOIS QUE CONFIGURAR

### Sistema Funciona Para:

✅ **Criar usuários**
- Novo usuário é salvo em `Usuario` tabela
- Aparece na lista
- Pode ser editado/deletado

✅ **Criar documentos**
- Novo documento é salvo em `Documento` tabela
- Pode fazer upload
- Pode compartilhar

✅ **Criar compras**
- Nova compra é salva em `Compra` tabela
- Pode gerar relatório
- Pode exportar

✅ **E todos os outros módulos...**

---

## 🆘 SE NÃO FUNCIONAR

### Problema: Ainda recebo 403

**Verificar:**
```
1. Contar registros na tabela Permissao
   → Deve ter 35 para usuario_id = 1
   
2. Fazer novo login
   → Limpar cache/cookies
   
3. Verificar que o token foi atualizado
   → Abrir DevTools (F12)
   → Application → localStorage
   → Ver se tem novo "token"
```

### Problema: Dados não salvam

**Verificar:**
```
1. Ver erro exato no console (F12)
2. Verificar conexão com PostgreSQL
3. Verificar se Backend está rodando
   → docker logs siga_secult_backend
```

### Problema: Notificações não aparecem

**Verificar:**
```
1. Frontend está usando NotificationContext
2. main.jsx tem NotificationProvider
3. Componentes usam useNotification hook
```

---

## 📚 ARQUIVOS IMPORTANTES

### Para Configurar Permissões

| Arquivo | Uso |
|---------|-----|
| COPIAR_COLAR_403.md | 35 permissões prontas |
| CONCEDER_PERMISSOES_AUTOMATICO.sql | Script automático |

### Para Entender o Código

| Arquivo | O que faz |
|---------|-----------|
| frontend/src/pages/LoginPage.jsx | Login com JWT |
| backend/src/middleware/auth.js | Validação JWT + RBAC |
| frontend/src/contexts/NotificationContext.jsx | Notificações |
| backend/prisma/schema.prisma | Schema do banco |

### Para Referência

| Arquivo | Conteúdo |
|---------|----------|
| GUIA_COMPLETO_INTEGRACAO.md | Tutorial completo |
| README_INTEGRACAO.md | Quick start |

---

## ✅ RESUMO FINAL

```
1. Sua estrutura está 100% pronta
2. Código está implementado corretamente
3. Banco PostgreSQL está rodando
4. SÓ FALTA conceder as 35 permissões

Próximo passo:
  → Abra: COPIAR_COLAR_403.md
  → Siga os 5 passos
  → Sistema ficará 100% funcional!

Tempo total: 5-10 minutos
Dificuldade: ⭐ Muito fácil
```

---

**COMECE AGORA:** Abra `COPIAR_COLAR_403.md` 🚀

