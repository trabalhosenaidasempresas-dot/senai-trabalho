/**
 * SCRIPT PARA CONCEDER PERMISSÕES VIA SQL
 * 
 * Execute este SQL diretamente no banco de dados
 * Através do Adminer: http://localhost:8080
 * ou via psql
 */

-- Buscar o ID do admin
SELECT id, email, nome FROM usuarios WHERE email = 'admin@secult.com';

-- Inserir permissões para o admin (substituir 'ADMIN_ID' pelo ID retornado acima)
INSERT INTO permissoes (id, usuario_id, modulo, acao, concedido, data_concessao, created_at, updated_at)
VALUES
  -- Usuarios
  ('perm_001', 'ADMIN_ID', 'usuarios', 'criar', true, NOW(), NOW(), NOW()),
  ('perm_002', 'ADMIN_ID', 'usuarios', 'ler', true, NOW(), NOW(), NOW()),
  ('perm_003', 'ADMIN_ID', 'usuarios', 'atualizar', true, NOW(), NOW(), NOW()),
  ('perm_004', 'ADMIN_ID', 'usuarios', 'deletar', true, NOW(), NOW(), NOW()),
  
  -- Documentos
  ('perm_005', 'ADMIN_ID', 'documentos', 'criar', true, NOW(), NOW(), NOW()),
  ('perm_006', 'ADMIN_ID', 'documentos', 'ler', true, NOW(), NOW(), NOW()),
  ('perm_007', 'ADMIN_ID', 'documentos', 'atualizar', true, NOW(), NOW(), NOW()),
  ('perm_008', 'ADMIN_ID', 'documentos', 'deletar', true, NOW(), NOW(), NOW()),
  
  -- Compras
  ('perm_009', 'ADMIN_ID', 'compras', 'criar', true, NOW(), NOW(), NOW()),
  ('perm_010', 'ADMIN_ID', 'compras', 'ler', true, NOW(), NOW(), NOW()),
  ('perm_011', 'ADMIN_ID', 'compras', 'atualizar', true, NOW(), NOW(), NOW()),
  ('perm_012', 'ADMIN_ID', 'compras', 'deletar', true, NOW(), NOW(), NOW()),
  
  -- Estoque
  ('perm_013', 'ADMIN_ID', 'estoque', 'criar', true, NOW(), NOW(), NOW()),
  ('perm_014', 'ADMIN_ID', 'estoque', 'ler', true, NOW(), NOW(), NOW()),
  ('perm_015', 'ADMIN_ID', 'estoque', 'atualizar', true, NOW(), NOW(), NOW()),
  ('perm_016', 'ADMIN_ID', 'estoque', 'deletar', true, NOW(), NOW(), NOW()),
  
  -- Ocorrencias
  ('perm_017', 'ADMIN_ID', 'ocorrencias', 'criar', true, NOW(), NOW(), NOW()),
  ('perm_018', 'ADMIN_ID', 'ocorrencias', 'ler', true, NOW(), NOW(), NOW()),
  ('perm_019', 'ADMIN_ID', 'ocorrencias', 'atualizar', true, NOW(), NOW(), NOW()),
  ('perm_020', 'ADMIN_ID', 'ocorrencias', 'deletar', true, NOW(), NOW(), NOW()),
  
  -- Agenda
  ('perm_021', 'ADMIN_ID', 'agenda', 'criar', true, NOW(), NOW(), NOW()),
  ('perm_022', 'ADMIN_ID', 'agenda', 'ler', true, NOW(), NOW(), NOW()),
  ('perm_023', 'ADMIN_ID', 'agenda', 'atualizar', true, NOW(), NOW(), NOW()),
  ('perm_024', 'ADMIN_ID', 'agenda', 'deletar', true, NOW(), NOW(), NOW()),
  
  -- Comunicacao
  ('perm_025', 'ADMIN_ID', 'comunicacao', 'criar', true, NOW(), NOW(), NOW()),
  ('perm_026', 'ADMIN_ID', 'comunicacao', 'ler', true, NOW(), NOW(), NOW()),
  ('perm_027', 'ADMIN_ID', 'comunicacao', 'atualizar', true, NOW(), NOW(), NOW()),
  ('perm_028', 'ADMIN_ID', 'comunicacao', 'deletar', true, NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Verificar permissões concedidas
SELECT COUNT(*) as total_permissoes 
FROM permissoes 
WHERE usuario_id = 'ADMIN_ID' AND concedido = true;
