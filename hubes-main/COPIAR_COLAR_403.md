# 📋 COPIAR E COLAR - ERRO 403 RESOLVIDO EM 5 MINUTOS

---

## ✅ MÉTODO: Adminer (Mais Fácil)

### PASSO 1: ABRA BROWSER

```
http://localhost:8080
```

---

### PASSO 2: LOGIN

**Copie e preencha exatamente:**

| Campo | Valor |
|-------|-------|
| **Sistema** | PostgreSQL |
| **Servidor** | postgres |
| **Usuário** | siga_user |
| **Senha** | siga_password |
| **Banco de Dados** | siga_secult |

Clique: **Enviar** ou **Login**

---

### PASSO 3: ABRA TABELA "Permissao"

No menu esquerdo, procure e clique em: **Permissao**

---

### PASSO 4: NOVO REGISTRO

Clique em: **Novo Registro** ou **+** ou **Inserir**

---

### PASSO 5: ADICIONE CADA PERMISSÃO

**Preencha os campos assim:**

```
usuario_id:  1
modulo:      [veja tabela abaixo]
acao:        [veja tabela abaixo]
criado_em:   [deixe vazio ou auto]
```

Clique: **Salvar**

Repita 35 vezes (uma para cada linha abaixo)

---

## 📋 TABELA DE PERMISSÕES - COPIE CADA LINHA

### MÓDULO: Usuarios (5 ações)
```
usuario_id: 1 | modulo: Usuarios | acao: listar
usuario_id: 1 | modulo: Usuarios | acao: criar
usuario_id: 1 | modulo: Usuarios | acao: editar
usuario_id: 1 | modulo: Usuarios | acao: deletar
usuario_id: 1 | modulo: Usuarios | acao: visualizar
```

### MÓDULO: Documentos (5 ações)
```
usuario_id: 1 | modulo: Documentos | acao: listar
usuario_id: 1 | modulo: Documentos | acao: criar
usuario_id: 1 | modulo: Documentos | acao: editar
usuario_id: 1 | modulo: Documentos | acao: deletar
usuario_id: 1 | modulo: Documentos | acao: visualizar
```

### MÓDULO: Compras (5 ações)
```
usuario_id: 1 | modulo: Compras | acao: listar
usuario_id: 1 | modulo: Compras | acao: criar
usuario_id: 1 | modulo: Compras | acao: editar
usuario_id: 1 | modulo: Compras | acao: deletar
usuario_id: 1 | modulo: Compras | acao: visualizar
```

### MÓDULO: Estoque (5 ações)
```
usuario_id: 1 | modulo: Estoque | acao: listar
usuario_id: 1 | modulo: Estoque | acao: criar
usuario_id: 1 | modulo: Estoque | acao: editar
usuario_id: 1 | modulo: Estoque | acao: deletar
usuario_id: 1 | modulo: Estoque | acao: visualizar
```

### MÓDULO: Ocorrencias (5 ações)
```
usuario_id: 1 | modulo: Ocorrencias | acao: listar
usuario_id: 1 | modulo: Ocorrencias | acao: criar
usuario_id: 1 | modulo: Ocorrencias | acao: editar
usuario_id: 1 | modulo: Ocorrencias | acao: deletar
usuario_id: 1 | modulo: Ocorrencias | acao: visualizar
```

### MÓDULO: Agenda (5 ações)
```
usuario_id: 1 | modulo: Agenda | acao: listar
usuario_id: 1 | modulo: Agenda | acao: criar
usuario_id: 1 | modulo: Agenda | acao: editar
usuario_id: 1 | modulo: Agenda | acao: deletar
usuario_id: 1 | modulo: Agenda | acao: visualizar
```

### MÓDULO: Comunicacao (5 ações)
```
usuario_id: 1 | modulo: Comunicacao | acao: listar
usuario_id: 1 | modulo: Comunicacao | acao: criar
usuario_id: 1 | modulo: Comunicacao | acao: editar
usuario_id: 1 | modulo: Comunicacao | acao: deletar
usuario_id: 1 | modulo: Comunicacao | acao: visualizar
```

---

## ✅ VERIFICAR SUCESSO

1. **Contar registros na tabela Permissao**
   - Deve ter exatamente: **35 registros**
   - Para usuario_id = 1

2. **Fazer novo login**
   - http://localhost
   - Email: admin@secult.com
   - Senha: admin123

3. **Testar um endpoint**
   - Ir para "Usuários" no menu
   - Deve mostrar lista (não error 403)

4. **Erro 403 deve desaparecer ✅**

---

## ⏱️ TEMPO ESTIMADO

```
Passo 1-3:    1 minuto
Passo 4-5:    4 minutos
Total:        5 minutos
```

---

## 🎯 RESUMO

| Item | Valor |
|------|-------|
| **Total de permissões** | 35 |
| **Módulos** | 7 |
| **Ações por módulo** | 5 |
| **usuario_id** | 1 (admin) |
| **Tempo** | 5 minutos |
| **Resultado** | ✅ Erro 403 desaparece |

---

**Não sabe se fez certo?**
- Na tabela Permissao, clique em "Select" 
- Deve aparecer: 35 registros para usuario_id = 1

**Ainda tem erro 403?**
- Verifique se realmente tem 35 permissões
- Faça logout e login novamente
- Limpe cache/cookies do navegador

