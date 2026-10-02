#!/bin/bash

# ============================================
# SCRIPT PARA CONCEDER PERMISSÕES AO ADMIN
# ============================================
# Execução: bash conceder_permissoes.sh
# ou: chmod +x conceder_permissoes.sh && ./conceder_permissoes.sh

echo "🔐 Concedendo permissões ao usuário Admin..."
echo ""

# Conectar ao PostgreSQL e executar SQL
docker exec -i siga_secult_db psql -U siga_user -d siga_secult << EOF

-- Buscar ID do admin
SELECT 'Usuário Admin:' AS info, id, email, nome FROM usuarios WHERE email = 'admin@secult.com';

-- Salvar ID em variável (não é possível no psql, então vamos fazer diretamente)
-- Primeiro, vamos limpar permissões antigas (opcional)
-- DELETE FROM permissoes WHERE usuario_id IN (SELECT id FROM usuarios WHERE email = 'admin@secult.com');

-- Inserir permissões
INSERT INTO permissoes (id, usuario_id, modulo, acao, concedido, data_concessao, created_at, updated_at)
SELECT 
  'perm_' || row_number() OVER () AS id,
  u.id,
  perms.modulo,
  perms.acao,
  true,
  NOW(),
  NOW(),
  NOW()
FROM usuarios u
CROSS JOIN (
  VALUES 
    ('usuarios', 'criar'),
    ('usuarios', 'ler'),
    ('usuarios', 'atualizar'),
    ('usuarios', 'deletar'),
    ('documentos', 'criar'),
    ('documentos', 'ler'),
    ('documentos', 'atualizar'),
    ('documentos', 'deletar'),
    ('compras', 'criar'),
    ('compras', 'ler'),
    ('compras', 'atualizar'),
    ('compras', 'deletar'),
    ('compras', 'aprovar'),
    ('estoque', 'criar'),
    ('estoque', 'ler'),
    ('estoque', 'atualizar'),
    ('estoque', 'deletar'),
    ('ocorrencias', 'criar'),
    ('ocorrencias', 'ler'),
    ('ocorrencias', 'atualizar'),
    ('ocorrencias', 'deletar'),
    ('agenda', 'criar'),
    ('agenda', 'ler'),
    ('agenda', 'atualizar'),
    ('agenda', 'deletar'),
    ('comunicacao', 'criar'),
    ('comunicacao', 'ler'),
    ('comunicacao', 'atualizar'),
    ('comunicacao', 'deletar')
) AS perms(modulo, acao)
WHERE u.email = 'admin@secult.com' AND u.perfil = 'Administrador'
ON CONFLICT DO NOTHING;

-- Verificar resultado
SELECT COUNT(*) AS total_permissoes FROM permissoes 
WHERE usuario_id IN (SELECT id FROM usuarios WHERE email = 'admin@secult.com');

EOF

echo ""
echo "✅ Permissões concedidas com sucesso!"
echo ""
echo "👉 Próximos passos:"
echo "   1. Fazer logout do sistema"
echo "   2. Fazer login novamente"
echo "   3. Todos os endpoints estarão disponíveis!"
echo ""
