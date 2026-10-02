# 🔐 GUIA RÁPIDO - RESOLVER ERRO 403 (ACESSO NEGADO)

**Status:** Seu erro 403 é **NORMAL** e significa que o RBAC está funcionando! ✅  
**Solução:** Conceder permissões ao admin em 2 minutos

---

## 📍 O que é o Erro 403?

```
❌ Status 403 Forbidden
└─ Significado: Acesso negado, permissão insuficiente
└─ Causa: Admin não tem permissões no banco de dados
└─ Status do Sistema: ✅ Funcionando perfeitamente (RBAC ativo)
```

**É esperado!** O sistema está funcionando como deve. Você só precisa conceder as permissões.

---

## ✅ SOLUÇÃO RÁPIDA (2 MINUTOS)

### Opção 1️⃣: Via Adminer (Mais Fácil - 1 minuto)

**Passo 1: Abra Adminer**
```
Acesse: http://localhost:8080
```

**Passo 2: Faça Login**
```
Sistema: PostgreSQL
Servidor: postgres
Usuário: siga_user
Senha: siga_password
Banco: siga_secult
[Enviar]
```

**Passo 3: Ir para Tabela "usuario"**
```
1. No menu esquerdo, clique em: usuario
2. Procure pela linha onde email = 'admin@secult.com'
3. Copie o número na coluna 'id' (ex: 1)
4. Guarde esse número!
```

**Passo 4: Ir para Tabela "Permissao"**
```
1. No menu esquerdo, clique em: Permissao
2. Clique em "Novo Registro" (ou "+")
3. Preencha os campos:
   - usuario_id: [Copie o ID do admin - ex: 1]
   - modulo: Usuarios
   - acao: listar
4. Clique em "Salvar"
5. Repita para cada módulo e ação
```

**Passo 5: Adicione Para Cada Módulo**

Copie e coloque cada combinação:

```
Módulo: Usuarios      | Ações: listar, criar, editar, deletar, visualizar
Módulo: Documentos    | Ações: listar, criar, editar, deletar, visualizar
Módulo: Compras       | Ações: listar, criar, editar, deletar, visualizar
Módulo: Estoque       | Ações: listar, criar, editar, deletar, visualizar
Módulo: Ocorrencias   | Ações: listar, criar, editar, deletar, visualizar
Módulo: Agenda        | Ações: listar, criar, editar, deletar, visualizar
Módulo: Comunicacao   | Ações: listar, criar, editar, deletar, visualizar
```

**Total: 35 registros (7 módulos × 5 ações)**

---

### Opção 2️⃣: Via SQL (Automático - 1 minuto)

**Passo 1: Abra Adminer**
```
Acesse: http://localhost:8080
```

**Passo 2: Faça Login**
```
Sistema: PostgreSQL
Servidor: postgres
Usuário: siga_user
Senha: siga_password
Banco: siga_secult
```

**Passo 3: Abra SQL Console**
```
1. No menu superior, clique em "SQL command"
2. Abra o arquivo: CONCEDER_PERMISSOES_AUTOMATICO.sql
3. Copie TODO o conteúdo
4. Cole no console
5. Clique em "Execute"
```

**Pronto!** 35 permissões concedidas automaticamente! ✅

---

## ✅ VERIFICAÇÃO

### Testar Novamente

Após conceder permissões:

**1. Fazer Login**
```
http://localhost
Email: admin@secult.com
Senha: admin123
```

**2. Testar um Endpoint**
```
curl http://localhost/api/usuarios \
  -H "Authorization: Bearer [seu_token_aqui]"

Resultado esperado:
{
  "success": true,
  "message": "Usuários listados com sucesso",
  "data": [...]
}
```

**3. Verificar Erro 403 Desapareceu**
```
✅ GET /usuarios → 200 OK (Antes era 403)
✅ GET /documentos → 200 OK (Antes era 403)
✅ GET /compras → 200 OK (Antes era 403)
... e todos os outros
```

---

## 📊 Exemplo de Permissões Concedidas

```
Usuario: admin@secult.com
Total de Permissões: 35

Modulos:  Usuarios, Documentos, Compras, Estoque, 
          Ocorrencias, Agenda, Comunicacao

Ações por módulo:
  ✅ listar      (Visualizar lista)
  ✅ criar       (Criar novo)
  ✅ editar      (Modificar)
  ✅ deletar     (Remover)
  ✅ visualizar  (Ver detalhes)
```

---

## 🎯 DEPOIS DE CONCEDER PERMISSÕES

### O Sistema Funcionará Assim:

**Antes (Com erro 403):**
```
GET /api/usuarios
← 403 Forbidden
← Mensagem: Acesso negado
```

**Depois (Com permissões):**
```
GET /api/usuarios
← 200 OK
← {
    "success": true,
    "message": "Usuários listados com sucesso",
    "data": [
      {
        "id": 1,
        "nome": "Admin User",
        "email": "admin@secult.com",
        "perfil": "Administrador"
      },
      ...
    ]
  }
```

---

## 🆘 Se Ainda Não Funcionar

### Verificação:

**1. Confirmar que as permissões foram salvas**
```
Adminer → SQL command → Execute:
SELECT * FROM "Permissao" 
WHERE usuario_id = (SELECT id FROM "Usuario" WHERE email = 'admin@secult.com')
LIMIT 10;

Deve retornar: Vários registros (não vazio)
```

**2. Confirmar que o token JWT é válido**
```
1. Faça login novamente
2. Copie o novo token
3. Tente novamente com: Authorization: Bearer [novo_token]
```

**3. Reiniciar o backend**
```
docker restart siga_secult_backend

Aguarde 10 segundos
Tente novamente
```

---

## 📝 Resumo da Solução

```
Problema:    403 Forbidden
Causa:       Sem permissões no banco
Solução 1:   Adicionar manualmente no Adminer (5 min)
Solução 2:   Executar SQL automático (1 min)

Resultado:   ✅ Todos os endpoints funcionando (200 OK)
```

---

## ✅ Checklist

- [ ] Abrir http://localhost:8080
- [ ] Login com siga_user / siga_password
- [ ] Encontrar ID do admin (admin@secult.com)
- [ ] Adicionar 35 permissões (7 módulos × 5 ações)
- [ ] Verificar em: SELECT * FROM "Permissao"
- [ ] Fazer novo login em http://localhost
- [ ] Testar um endpoint (deve retornar 200 OK)
- [ ] Pronto! ✅

---

## 🎉 Resultado Final

Após seguir este guia:

```
✅ Erro 403 desaparece
✅ Todos os endpoints funcionam
✅ Dados são salvos no banco normalmente
✅ Notificações aparecem corretamente
✅ Sistema 100% funcional
```

---

**Tempo estimado: 2-5 minutos**  
**Dificuldade: Muito fácil** ⭐  
**Resultado: Sistema 100% funcional** ✅

