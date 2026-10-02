# 🔐 SOLUÇÃO RÁPIDA - ERRO 403 (ACESSO NEGADO)

**Você está recebendo 403?** ✅ Normal! O sistema está funcionando.

---

## ⚡ SOLUÇÃO EM 3 PASSOS (5 MINUTOS)

### 1️⃣ Abra Adminer

```
🌐 http://localhost:8080
```

### 2️⃣ Faça Login

Copie e cole exatamente:
```
Sistema: PostgreSQL
Servidor: postgres
Usuário: siga_user
Senha: siga_password
Banco: siga_secult
```

### 3️⃣ Adicione as 35 Permissões

Ir para tabela: **Permissao** → Novo Registro

Copie cada linha abaixo e preencha um por um:

```
usuario_id: 1 | modulo: Usuarios | acao: listar
usuario_id: 1 | modulo: Usuarios | acao: criar
usuario_id: 1 | modulo: Usuarios | acao: editar
usuario_id: 1 | modulo: Usuarios | acao: deletar
usuario_id: 1 | modulo: Usuarios | acao: visualizar

usuario_id: 1 | modulo: Documentos | acao: listar
usuario_id: 1 | modulo: Documentos | acao: criar
usuario_id: 1 | modulo: Documentos | acao: editar
usuario_id: 1 | modulo: Documentos | acao: deletar
usuario_id: 1 | modulo: Documentos | acao: visualizar

usuario_id: 1 | modulo: Compras | acao: listar
usuario_id: 1 | modulo: Compras | acao: criar
usuario_id: 1 | modulo: Compras | acao: editar
usuario_id: 1 | modulo: Compras | acao: deletar
usuario_id: 1 | modulo: Compras | acao: visualizar

usuario_id: 1 | modulo: Estoque | acao: listar
usuario_id: 1 | modulo: Estoque | acao: criar
usuario_id: 1 | modulo: Estoque | acao: editar
usuario_id: 1 | modulo: Estoque | acao: deletar
usuario_id: 1 | modulo: Estoque | acao: visualizar

usuario_id: 1 | modulo: Ocorrencias | acao: listar
usuario_id: 1 | modulo: Ocorrencias | acao: criar
usuario_id: 1 | modulo: Ocorrencias | acao: editar
usuario_id: 1 | modulo: Ocorrencias | acao: deletar
usuario_id: 1 | modulo: Ocorrencias | acao: visualizar

usuario_id: 1 | modulo: Agenda | acao: listar
usuario_id: 1 | modulo: Agenda | acao: criar
usuario_id: 1 | modulo: Agenda | acao: editar
usuario_id: 1 | modulo: Agenda | acao: deletar
usuario_id: 1 | modulo: Agenda | acao: visualizar

usuario_id: 1 | modulo: Comunicacao | acao: listar
usuario_id: 1 | modulo: Comunicacao | acao: criar
usuario_id: 1 | modulo: Comunicacao | acao: editar
usuario_id: 1 | modulo: Comunicacao | acao: deletar
usuario_id: 1 | modulo: Comunicacao | acao: visualizar
```

---

## ✅ Pronto!

Após adicionar todos os 35:

```
1. Faça novo login em http://localhost
   Email: admin@secult.com
   Senha: admin123

2. Erro 403 deve desaparecer

3. Crie um novo usuário e salve no banco normalmente
```

---

## 📊 Se Não Funcionar

1. **Verifique se as 35 permissões foram realmente adicionadas:**
   - Ir para tabela Permissao
   - Contar quantos registros existem para usuario_id = 1
   - Deve ter 35

2. **Se tiver menos de 35:**
   - Adicione os que faltam

3. **Se tiver duplicadas:**
   - Delete as duplicatas
   - Deixe apenas 35 (7 módulos × 5 ações)

4. **Depois faça novo login:**
   - Limpe cookies/cache
   - Faça logout completo
   - Login novamente com admin@secult.com / admin123
   - Tente um endpoint

---

## 🎯 Problema vs Solução

| Problema | Causa | Solução |
|----------|-------|---------|
| 403 Forbidden | Sem permissões | Adicionar 35 permissões |
| Erro persiste | Token antigo | Fazer novo login |
| Erro em módulo específico | Permissão daquele módulo | Adicionar aquela permissão |

---

**Tempo:** 5 minutos  
**Dificuldade:** ⭐ Muito fácil  
**Resultado:** ✅ Sistema 100% funcional
