# 🔐 GUIA COMPLETO - ROW LEVEL SECURITY (RLS) NO SUPABASE

## O QUE É RLS?

**Row Level Security (RLS)** é a segurança de controle de acesso no nível de linha do banco de dados. Funciona assim:

```
SEM RLS:
usuário_admin → SELECT * FROM compras → Vê TODAS as compras
usuário_comum → SELECT * FROM compras → Vê TODAS as compras ⚠️ PERIGOSO!

COM RLS:
usuário_admin → SELECT * FROM compras → Vê TODAS as compras ✅
usuário_comum → SELECT * FROM compras → Vê APENAS SUAS compras ✅
```

---

## 📋 DIFERENÇA: TLS vs RLS

| Aspecto | TLS | RLS |
|---------|-----|-----|
| O quê | Criptografia de conexão | Controle de acesso aos dados |
| Onde | Camada de transporte (rede) | Camada de banco de dados |
| Automático? | ✅ Sim (Supabase) | ❌ Não (precisa configurar) |
| Implementação | Certificado SSL/TLS | Políticas SQL |
| Protege contra | Interceptação de dados | Acesso não autorizado |

---

## 🚀 COMO IMPLEMENTAR RLS

### Passo 1: Preparar o Schema

```bash
# Já feito! Execute:
# 1. SUPABASE_SCHEMA.sql (cria tabelas)
# 2. SUPABASE_RLS_POLICIES.sql (cria políticas RLS)
```

### Passo 2: Executar Políticas RLS

**No Supabase SQL Editor:**
1. Copie o arquivo: `SUPABASE_RLS_POLICIES.sql`
2. Clique "New Query"
3. Cole o conteúdo inteiro
4. Clique "Run"

### Passo 3: Verificar no Dashboard

**Na Supabase:**
```
Dashboard → Database → Policies
```

Você verá algo como:

```
┌─ TABELA: usuarios ─────────────────────┐
│ ✓ Usuarios: Ver próprio perfil         │
│ ✓ Usuarios: Atualizar próprio perfil   │
│ ✓ Usuarios: Criar (admin apenas)       │
└────────────────────────────────────────┘

┌─ TABELA: documentos ────────────────────┐
│ ✓ Documentos: Visualização apropriada   │
│ ✓ Documentos: Atualizar (responsável)   │
│ ✓ Documentos: Criar (autenticado)       │
│ ✓ Documentos: Deletar (responsável)     │
└─────────────────────────────────────────┘
```

---

## 📚 POLÍTICAS IMPLEMENTADAS

### 1️⃣ USUÁRIOS

```
┌─ READ ─────────────────────┐
│ ✓ Vê perfil próprio        │
│ ✓ Admin vê todos           │
└────────────────────────────┘

┌─ UPDATE ───────────────────┐
│ ✓ Atualiza perfil próprio  │
│ ✓ Admin atualiza qualquer  │
└────────────────────────────┘

┌─ INSERT ───────────────────┐
│ ✓ Admin cria novos         │
└────────────────────────────┘
```

---

### 2️⃣ DOCUMENTOS

```
Tipo de Acesso         Quem Acessa
═════════════════════════════════════════
Público                Todos
Restrito               Todos
Confidencial            Responsável + Admin

Atualizar:             Responsável + Admin
Criar:                 Qualquer autenticado
Deletar:               Responsável + Admin
```

---

### 3️⃣ COMPRAS

```
Quem Vê                Status
═══════════════════════════════════════════
Solicitante            Suas compras
Admin/Gestor           Todas as compras

Quem Atualiza:         Solicitante + Admin/Gestor
Quem Cria:             Qualquer autenticado
```

---

### 4️⃣ OUTROS

| Tabela | Leitura | Escrita | Deletar |
|--------|---------|---------|---------|
| **Fornecedores** | Todos veem ativos | Admin | Admin |
| **Produtos** | Todos veem ativos | Admin/Gestor | Admin |
| **Estoque** | Todos veem histórico | Admin/Gestor | - |
| **Ocorrências** | Responsável/Admin | Responsável/Admin | - |
| **Serviços** | Responsável/Admin | Responsável/Admin | - |
| **Comunicados** | Todos veem públicos | Autor/Admin | Autor/Admin |
| **Mensagens** | Apenas participantes | Remetente | - |
| **Notificações** | Apenas do usuário | Admin | - |
| **Logs** | Apenas admin | Sistema | - |

---

## 💻 COMO USAR NO BACKEND

### Com ANON_KEY (Frontend + Usuario autenticado)

```javascript
// Frontend ou backend com user autenticado
const { data, error } = await supabase
  .from('compras')
  .select('*')

// RLS é aplicada AUTOMATICAMENTE
// Usuário comum só vê suas compras
// Admin vê todas
```

### Com SERVICE_KEY (Backend Admin)

```javascript
// Backend apenas (NUNCA exponha no frontend!)
const admin = supabase.createClient(
  SUPABASE_URL,
  SERVICE_KEY  // Bypass de RLS
)

// SERVICE_KEY ignora RLS
const { data, error } = await admin
  .from('compras')
  .select('*')  // Vê TUDO (sem RLS)
```

### Regra de Ouro:

```
┌─────────────────────────────────────────┐
│  FRONTEND + user autenticado            │
│  └─ Use: ANON_KEY (com RLS)            │
│                                          │
│  BACKEND (operações admin)              │
│  └─ Use: SERVICE_KEY (bypass RLS)     │
│                                          │
│  NUNCA EXPONHA SERVICE_KEY NO FRONTEND │
└─────────────────────────────────────────┘
```

---

## 🔑 VARIÁVEIS DE AMBIENTE

### Backend (.env)

```env
# Chave pública (frontend)
SUPABASE_ANON_KEY="eyJhbGc..."

# Chave de serviço (backend - NUNCA público!)
SUPABASE_SERVICE_KEY="eyJhbGc..."
```

### Exemplo Cliente Backend

```javascript
import { createClient } from '@supabase/supabase-js'

// Cliente para operações com usuário
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Cliente admin (bypass RLS)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)
```

---

## 🧪 TESTES DE RLS

### Teste 1: Verificar Política está Ativa

```sql
-- No SQL Editor do Supabase
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Resultado esperado: rowsecurity = true para todas
```

### Teste 2: Testar como Usuário Comum

```javascript
// No navegador (console)
// Assumindo usuário comum autenticado

const { data } = await supabase
  .from('logs')
  .select('*')

console.log(data)  // Deve retornar vazio (acesso negado)
```

### Teste 3: Testar como Admin

```javascript
// Assumindo usuário admin autenticado

const { data } = await supabase
  .from('logs')
  .select('*')

console.log(data)  // Deve retornar logs
```

---

## ⚠️ ARMADILHAS COMUNS

### ❌ Problema 1: RLS Quebra Queries

```javascript
// ❌ ERRADO: Sem tratamento de erro
const { data } = await supabase
  .from('compras')
  .select('*')
// Se RLS nega, retorna []

// ✅ CORRETO: Sempre verificar erro
const { data, error } = await supabase
  .from('compras')
  .select('*')

if (error) {
  console.error('Acesso negado:', error)
}
```

### ❌ Problema 2: Exponha SERVICE_KEY

```javascript
// ❌ NUNCA FAÇA ISSO:
const client = supabase.createClient(
  URL,
  SERVICE_KEY  // ← EXPOSTO NO FRONTEND!
)

// ✅ FAÇA ASSIM:
// SERVICE_KEY só no backend (.env)
```

### ❌ Problema 3: Foreign Keys Falham com RLS

```javascript
// ❌ ERRADO: Insert de documento falha se responsável_id não é visível
const { data, error } = await supabase
  .from('documentos')
  .insert([{ titulo: 'X', responsavel_id: 'user-2' }])

// ✅ CORRETO: Use service_key ou garanta que pode ver o responsável
```

---

## 🔧 MODIFICAR POLÍTICAS

### Adicionar Nova Política

```sql
CREATE POLICY "Nome da Política"
  ON nome_tabela
  FOR SELECT
  USING (auth.uid()::text = user_id);
```

### Deletar Política

```sql
DROP POLICY "Nome da Política" ON nome_tabela;
```

### Alterar Política

```sql
-- Não é possível alterar diretamente
-- Solução: DROP e CREATE novamente

DROP POLICY "Nome da Política" ON nome_tabela;

CREATE POLICY "Nome da Política"
  ON nome_tabela
  FOR SELECT
  USING (nova_condicao);
```

---

## 📊 PERFORMANCE COM RLS

### Como RLS Afeta Performance

```
SEM RLS:
SELECT * FROM compras  → Rápido (todos dados)

COM RLS:
SELECT * FROM compras  → Um pouco mais lento
                       (Supabase aplica filtro WHERE automaticamente)
```

### Otimizações

✅ Índices já criados em:
```sql
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil);
CREATE INDEX idx_compras_solicitante ON compras(solicitante_id);
CREATE INDEX idx_ocorrencias_responsavel ON ocorrencias(responsavel_id);
-- etc...
```

✅ Dicas adicionais:
1. Mantenha políticas simples
2. Use índices nas colunas visitadas
3. Evite subqueries complexas em USING

---

## 🚨 SEGURANÇA

### Máximas de Segurança

```
1. RLS está ATIVADO
   └─ Qualquer query passa pelo RLS

2. Por defaut: NEGA acesso
   └─ Se não há política, retorna vazio

3. Múltiplas políticas = OR
   └─ Se passar em UMA, acessa

4. Exemplo:
   ┌─ Política 1: auth.uid() = owner ────┐
   │ ┌─ Política 2: SELECT public only ─┤
   │ └─ Política 3: admin bypass ───────┤
   └─────────────────────────────────────┘
   User vê dados se: P1 OR P2 OR P3
```

### Checklist de Segurança

- [x] RLS habilitado em todas as tabelas
- [x] Políticas criadas para leitura
- [x] Políticas criadas para escrita
- [x] SERVICE_KEY protegido
- [x] ANON_KEY usado no frontend
- [x] Índices otimizados
- [x] Testes realizados

---

## 📞 TROUBLESHOOTING RLS

| Problema | Causa | Solução |
|----------|-------|---------|
| "Não vejo dados" | RLS negando acesso | Verificar política vs dados |
| "Permission denied" | Operação bloqueada | Adicionar política apropriada |
| "Queries lentes" | RLS não otimizado | Adicionar índices |
| "Foreign key error" | RLS bloqueia ref | Usar service_key |
| "Admin não vê tudo" | Admin_check incompleto | Revisar política |

---

## 🎯 FLUXO RECOMENDADO

```
1️⃣  EXECUTAR SUPABASE_SCHEMA.sql
    └─ Cria todas as tabelas

2️⃣  EXECUTAR SUPABASE_RLS_POLICIES.sql
    └─ Cria todas as políticas RLS

3️⃣  TESTAR NO DASHBOARD
    └─ Verificar no Policies tab

4️⃣  ATUALIZAR .ENV
    └─ Incluir ANON_KEY e SERVICE_KEY

5️⃣  IMPLEMENTAR NO BACKEND
    └─ Usar supabase client com RLS

6️⃣  TESTAR COM USUÁRIOS
    └─ Verificar acesso apropriado
```

---

## 📖 DOCUMENTAÇÃO EXTRA

- [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

## ✅ VOCÊ AGORA TEM:

- ✅ RLS implementado em 14+ tabelas
- ✅ Políticas de leitura/escrita/deleção
- ✅ Índices otimizados
- ✅ Exemplo de uso no backend
- ✅ Testes fornecidos
- ✅ Documentação completa

**Status:** Ready to Deploy 🚀
