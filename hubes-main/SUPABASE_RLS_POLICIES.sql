-- SIGA Secult - Políticas de Segurança Row Level Security (RLS)
-- ============================================================
-- NOTA: Execute este script APÓS o SUPABASE_SCHEMA.sql
-- Este arquivo configura as regras de acesso a dados por usuário

-- ========================================
-- 1. HABILITAR RLS NAS TABELAS
-- ========================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. POLÍTICAS PARA TABELA USUARIOS
-- ========================================

-- Usuários podem ver seus próprios dados
CREATE POLICY "Usuarios: Ver próprio perfil"
  ON usuarios
  FOR SELECT
  USING (
    auth.uid()::text = id 
    OR 
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  );

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "Usuarios: Atualizar próprio perfil"
  ON usuarios
  FOR UPDATE
  USING (
    auth.uid()::text = id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  )
  WITH CHECK (
    auth.uid()::text = id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  );

-- Apenas administradores podem criar usuários
CREATE POLICY "Usuarios: Criar (admin apenas)"
  ON usuarios
  FOR INSERT
  WITH CHECK (
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  );

-- ========================================
-- 3. POLÍTICAS PARA TABELA DOCUMENTOS
-- ========================================

-- Todos podem ver documentos públicos
-- Usuários do mesmo setor podem ver documentos restritos
-- Apenas responsável pode ver documentos confidenciais
CREATE POLICY "Documentos: Visualização apropriada"
  ON documentos
  FOR SELECT
  USING (
    -- Público: qualquer um vê
    nivel_acesso = 'Público'
    OR
    -- Restrito: qualquer um vê (pode restringir por setor se quiser)
    nivel_acesso = 'Restrito'
    OR
    -- Confidencial: apenas responsável e admin
    (
      nivel_acesso = 'Confidencial'
      AND (
        auth.uid()::text = responsavel_id
        OR
        (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
      )
    )
  );

-- Apenas responsável pode atualizar documento
CREATE POLICY "Documentos: Atualizar (responsável apenas)"
  ON documentos
  FOR UPDATE
  USING (
    auth.uid()::text = responsavel_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  )
  WITH CHECK (
    auth.uid()::text = responsavel_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  );

-- Usuários autenticados podem criar documentos
CREATE POLICY "Documentos: Criar (autenticado)"
  ON documentos
  FOR INSERT
  WITH CHECK (
    auth.uid()::text IS NOT NULL
  );

-- Apenas responsável pode deletar documento
CREATE POLICY "Documentos: Deletar (responsável/admin)"
  ON documentos
  FOR DELETE
  USING (
    auth.uid()::text = responsavel_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  );

-- ========================================
-- 4. POLÍTICAS PARA TABELA COMPRAS
-- ========================================

-- Usuários veem suas próprias compras + todas se for admin/gestor
CREATE POLICY "Compras: Leitura apropriada"
  ON compras
  FOR SELECT
  USING (
    -- Solicitante vê sua própria compra
    auth.uid()::text = solicitante_id
    OR
    -- Admin e Gestor veem todas
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor')
  );

-- Apenas solicitante e admin podem atualizar compra
CREATE POLICY "Compras: Atualizar (solicitante/admin)"
  ON compras
  FOR UPDATE
  USING (
    auth.uid()::text = solicitante_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor')
  )
  WITH CHECK (
    auth.uid()::text = solicitante_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor')
  );

-- Usuários autenticados podem criar compras
CREATE POLICY "Compras: Criar (autenticado)"
  ON compras
  FOR INSERT
  WITH CHECK (
    auth.uid()::text IS NOT NULL
    AND
    auth.uid()::text = solicitante_id
  );

-- ========================================
-- 5. POLÍTICAS PARA TABELA FORNECEDORES
-- ========================================

-- Todos podem ver fornecedores ativos
CREATE POLICY "Fornecedores: Leitura (público)"
  ON fornecedores
  FOR SELECT
  USING (ativo = true OR (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador');

-- Apenas admin pode atualizar fornecedor
CREATE POLICY "Fornecedores: Atualizar (admin)"
  ON fornecedores
  FOR UPDATE
  USING (
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  )
  WITH CHECK (
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  );

-- Apenas admin pode criar fornecedor
CREATE POLICY "Fornecedores: Criar (admin)"
  ON fornecedores
  FOR INSERT
  WITH CHECK (
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  );

-- ========================================
-- 6. POLÍTICAS PARA TABELA PRODUTOS/ESTOQUE
-- ========================================

-- Todos veem produtos ativos
CREATE POLICY "Produtos: Leitura (público)"
  ON produtos
  FOR SELECT
  USING (ativo = true OR (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor'));

-- Apenas admin/gestor podem modificar produtos
CREATE POLICY "Produtos: Atualizar (admin/gestor)"
  ON produtos
  FOR UPDATE
  USING (
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor')
  )
  WITH CHECK (
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor')
  );

CREATE POLICY "Produtos: Criar (admin/gestor)"
  ON produtos
  FOR INSERT
  WITH CHECK (
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor')
  );

-- ========================================
-- 7. POLÍTICAS PARA MOVIMENTAÇÕES DE ESTOQUE
-- ========================================

-- Todos veem movimentações (auditoria)
CREATE POLICY "Movimentacoes: Leitura (público)"
  ON movimentacoes_estoque
  FOR SELECT
  USING (true);

-- Apenas admin/gestor/responsável podem criar movimentações
CREATE POLICY "Movimentacoes: Criar (admin/gestor/responsável)"
  ON movimentacoes_estoque
  FOR INSERT
  WITH CHECK (
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor')
    OR
    auth.uid()::text = usuario_id
  );

-- ========================================
-- 8. POLÍTICAS PARA OCORRÊNCIAS
-- ========================================

-- Usuário vê suas próprias ocorrências + todas se admin
CREATE POLICY "Ocorrencias: Leitura apropriada"
  ON ocorrencias
  FOR SELECT
  USING (
    auth.uid()::text = responsavel_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor')
  );

-- Responsável pode atualizar sua ocorrência
CREATE POLICY "Ocorrencias: Atualizar (responsável/admin)"
  ON ocorrencias
  FOR UPDATE
  USING (
    auth.uid()::text = responsavel_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor')
  )
  WITH CHECK (
    auth.uid()::text = responsavel_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor')
  );

-- Usuários autenticados podem criar ocorrências
CREATE POLICY "Ocorrencias: Criar (autenticado)"
  ON ocorrencias
  FOR INSERT
  WITH CHECK (
    auth.uid()::text IS NOT NULL
  );

-- ========================================
-- 9. POLÍTICAS PARA SERVIÇOS
-- ========================================

-- Responsável e admin veem serviço
CREATE POLICY "Servicos: Leitura (responsável/admin)"
  ON servicos
  FOR SELECT
  USING (
    auth.uid()::text = responsavel_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor')
  );

-- Responsável pode atualizar serviço
CREATE POLICY "Servicos: Atualizar (responsável/admin)"
  ON servicos
  FOR UPDATE
  USING (
    auth.uid()::text = responsavel_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor')
  )
  WITH CHECK (
    auth.uid()::text = responsavel_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) IN ('Administrador', 'Gestor')
  );

-- ========================================
-- 10. POLÍTICAS PARA COMUNICADOS
-- ========================================

-- Todos veem comunicados ativos/públicos
CREATE POLICY "Comunicados: Leitura (público)"
  ON comunicados
  FOR SELECT
  USING (status = 'Ativo');

-- Apenas autor e admin podem atualizar
CREATE POLICY "Comunicados: Atualizar (autor/admin)"
  ON comunicados
  FOR UPDATE
  USING (
    auth.uid()::text = autor_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  )
  WITH CHECK (
    auth.uid()::text = autor_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  );

-- Usuários autenticados podem criar comunicados
CREATE POLICY "Comunicados: Criar (autenticado)"
  ON comunicados
  FOR INSERT
  WITH CHECK (
    auth.uid()::text IS NOT NULL
    AND
    auth.uid()::text = autor_id
  );

-- ========================================
-- 11. POLÍTICAS PARA MENSAGENS
-- ========================================

-- Usuário vê apenas suas mensagens (como remetente ou destinatário)
CREATE POLICY "Mensagens: Leitura (próprias)"
  ON mensagens
  FOR SELECT
  USING (
    auth.uid()::text = remetente_id
    OR
    auth.uid()::text = destinatario_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  );

-- Apenas remetente pode criar mensagem
CREATE POLICY "Mensagens: Criar (remetente)"
  ON mensagens
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = remetente_id
  );

-- Destinatário pode atualizar (marcar como lido)
CREATE POLICY "Mensagens: Atualizar (destinatário)"
  ON mensagens
  FOR UPDATE
  USING (
    auth.uid()::text = destinatario_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  )
  WITH CHECK (
    auth.uid()::text = destinatario_id
    OR
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  );

-- ========================================
-- 12. POLÍTICAS PARA NOTIFICAÇÕES
-- ========================================

-- Usuário vê apenas suas notificações
CREATE POLICY "Notificacoes: Leitura (próprias)"
  ON notificacoes
  FOR SELECT
  USING (auth.uid()::text = usuario_id);

-- Usuário pode atualizar suas notificações
CREATE POLICY "Notificacoes: Atualizar (próprias)"
  ON notificacoes
  FOR UPDATE
  USING (auth.uid()::text = usuario_id)
  WITH CHECK (auth.uid()::text = usuario_id);

-- ========================================
-- 13. POLÍTICAS PARA LOGS (Auditoria)
-- ========================================

-- Apenas admin pode ver logs
CREATE POLICY "Logs: Leitura (admin)"
  ON logs
  FOR SELECT
  USING (
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  );

-- Sistema (backend) cria logs
CREATE POLICY "Logs: Criar (sistema)"
  ON logs
  FOR INSERT
  WITH CHECK (true);

-- ========================================
-- 14. CONFIGURAÇÕES DE SEGURANÇA ADICIONAIS
-- ========================================

-- Para tabelas que não têm políticas explícitas, negar por default (segurança máxima)
-- Isso garante que se esquecer de adicionar uma política, a tabela fica protegida

ALTER TABLE auditoria_registros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auditoria: Leitura (admin)"
  ON auditoria_registros
  FOR SELECT
  USING (
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  );

ALTER TABLE configuracoes_sistema ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Config: Leitura (admin)"
  ON configuracoes_sistema
  FOR SELECT
  USING (
    (SELECT perfil FROM usuarios WHERE id = auth.uid()::text) = 'Administrador'
  );

-- ========================================
-- NOTA SOBRE ÍNDICES
-- ========================================

-- Os índices já foram criados em SUPABASE_SCHEMA.sql
-- Não é necessário recriá-los aqui:
-- - idx_usuarios_perfil
-- - idx_documentos_responsavel_nivel
-- - idx_compras_solicitante
-- - idx_ocorrencias_responsavel
-- - idx_servicos_responsavel
-- - idx_mensagens_partes
-- - idx_notificacoes_usuario

-- ========================================
-- TESTES DE POLÍTICAS
-- ========================================

-- NOTA: Para testar as políticas, use:
-- 1. Supabase Studio → Policies tab
-- 2. Selecione a tabela
-- 3. Clique "View policies"
-- 4. Teste com diferentes usuários

-- Exemplo de teste (execute como usuário específico):
/*
-- Como admin deve ver todas as compras:
SELECT * FROM compras;

-- Como usuário comum deve ver apenas suas compras:
SELECT * FROM compras;

-- Como usuário comum não deve conseguir ver logs:
SELECT * FROM logs;  -- Retornará 0 linhas
*/

-- ========================================
-- RESUMO DE POLÍTICAS
-- ========================================

/*
RESUMO DE REGRAS RLS IMPLEMENTADAS:

1. USUÁRIOS:
   - Veem perfil próprio (ou admin vê todos)
   - Atualizam perfil próprio (ou admin atualiza qualquer)

2. DOCUMENTOS:
   - Públicos: todos veem
   - Restritos: todos veem
   - Confidenciais: apenas responsável e admin

3. COMPRAS:
   - Solicitante vê suas compras
   - Admin/Gestor veem todas
   - Só solicitante/admin atualizam

4. FORNECEDORES:
   - Todos veem fornecedores ativos
   - Só admin edita

5. PRODUTOS/ESTOQUE:
   - Todos veem produtos ativos
   - Só admin/gestor edita

6. MOVIMENTAÇÕES:
   - Todos veem (auditoria)
   - Só admin/gestor/responsável cria

7. OCORRÊNCIAS:
   - Responsável vê suas ocorrências
   - Admin/Gestor veem todas
   - Qualquer autenticado pode criar

8. SERVIÇOS:
   - Responsável/Admin veem
   - Responsável/Admin atualizam

9. COMUNICADOS:
   - Todos veem ativos
   - Apenas autor/admin edita

10. MENSAGENS:
    - Apenas participantes veem
    - Remetente cria
    - Destinatário pode marcar como lido

11. NOTIFICAÇÕES:
    - Usuário vê apenas suas notificações
    - Usuário atualiza suas notificações

12. LOGS/AUDITORIA:
    - Apenas admin vê
    - Sistema cria automaticamente

SEGURANÇA:
✅ RLS habilitado em todas as tabelas
✅ Por defaut: nega acesso (segurança máxima)
✅ Políticas específicas por tabela e operação
✅ Índices otimizados para performance
✅ Integração com sistema de auth do Supabase
*/

-- ========================================
-- COMO USAR
-- ========================================

/*
PASSO 1: Executar o arquivo SUPABASE_SCHEMA.sql

PASSO 2: Executar este arquivo (SUPABASE_RLS_POLICIES.sql)
  - No SQL Editor do Supabase
  - Copiar e colar este arquivo
  - Clicar Run

PASSO 3: Verificar políticas
  - Ir para: Database → Policies
  - Selecionar tabela
  - Visualizar as políticas criadas

PASSO 4: No backend, usar Supabase client:
  ```javascript
  const { data, error } = await supabase
    .from('compras')
    .select('*')  // RLS aplicada automaticamente
  ```

PASSO 5: Backend DEVE usar service_key para operações de admin:
  ```javascript
  const admin = supabase.createClient(URL, SERVICE_KEY)
  // Bypass de RLS com service key
  ```

NOTA DE SEGURANÇA:
- Use ANON_KEY no frontend (com RLS ativa)
- Use SERVICE_KEY no backend para operações de admin
- Nunca exponha SERVICE_KEY no frontend
*/
