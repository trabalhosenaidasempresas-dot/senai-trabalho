-- ============================================================================
-- SCRIPT: Conceder Todas as Permissões ao Admin SIGA Secult
-- ============================================================================
-- Este script concede ao usuário admin acesso a TODOS os módulos e ações
-- ============================================================================

BEGIN;

WITH admin_user AS (
  SELECT id FROM usuarios
  WHERE email = 'admin@secult.com'
  LIMIT 1
), permissoes_data AS (
  SELECT * FROM (VALUES
    ('Usuarios', 'listar'),
    ('Usuarios', 'criar'),
    ('Usuarios', 'editar'),
    ('Usuarios', 'deletar'),
    ('Usuarios', 'visualizar'),
    ('Documentos', 'listar'),
    ('Documentos', 'criar'),
    ('Documentos', 'editar'),
    ('Documentos', 'deletar'),
    ('Documentos', 'visualizar'),
    ('Compras', 'listar'),
    ('Compras', 'criar'),
    ('Compras', 'editar'),
    ('Compras', 'deletar'),
    ('Compras', 'visualizar'),
    ('Estoque', 'listar'),
    ('Estoque', 'criar'),
    ('Estoque', 'editar'),
    ('Estoque', 'deletar'),
    ('Estoque', 'visualizar'),
    ('Ocorrencias', 'listar'),
    ('Ocorrencias', 'criar'),
    ('Ocorrencias', 'editar'),
    ('Ocorrencias', 'deletar'),
    ('Ocorrencias', 'visualizar'),
    ('Agenda', 'listar'),
    ('Agenda', 'criar'),
    ('Agenda', 'editar'),
    ('Agenda', 'deletar'),
    ('Agenda', 'visualizar'),
    ('Comunicacao', 'listar'),
    ('Comunicacao', 'criar'),
    ('Comunicacao', 'editar'),
    ('Comunicacao', 'deletar'),
    ('Comunicacao', 'visualizar')
  ) AS t(modulo, acao)
)
INSERT INTO permissoes (id, "usuarioId", modulo, acao, concedido, "dataConcessao", "createdAt", "updatedAt")
SELECT
  md5(random()::text || clock_timestamp()::text),
  admin_user.id,
  permissoes_data.modulo,
  permissoes_data.acao,
  true,
  NOW(),
  NOW(),
  NOW()
FROM admin_user, permissoes_data
WHERE NOT EXISTS (
  SELECT 1 FROM permissoes p
  WHERE p."usuarioId" = admin_user.id
    AND p.modulo = permissoes_data.modulo
    AND p.acao = permissoes_data.acao
);

COMMIT;

-- Verificação final
SELECT count(*) as total_permissoes FROM permissoes WHERE "usuarioId" = (SELECT id FROM usuarios WHERE email = 'admin@secult.com');
SELECT modulo, acao FROM permissoes WHERE "usuarioId" = (SELECT id FROM usuarios WHERE email = 'admin@secult.com') ORDER BY modulo, acao;
