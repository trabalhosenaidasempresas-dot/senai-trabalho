/**
 * SCRIPT PARA CONCEDER PERMISSÕES AO USUÁRIO ADMIN
 * Execute este script no Prisma Studio ou direto no banco
 * 
 * Comando para executar:
 * npx ts-node prisma/seedPermissions.js
 * 
 * Ou manualmente no Prisma Studio:
 * npx prisma studio
 */

import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function seedPermissions() {
  console.log('🔐 Concedendo permissões ao usuário Administrador...\n');

  // Buscar o usuário admin
  const admin = await prisma.usuario.findUnique({
    where: { email: 'admin@secult.com' }
  });

  if (!admin) {
    console.error('❌ Usuário admin não encontrado');
    process.exit(1);
  }

  // Definir todas as permissões necessárias
  const permissoes = [
    // Usuários
    { modulo: 'usuarios', acao: 'criar' },
    { modulo: 'usuarios', acao: 'ler' },
    { modulo: 'usuarios', acao: 'atualizar' },
    { modulo: 'usuarios', acao: 'deletar' },
    { modulo: 'usuarios', acao: 'exportar' },

    // Documentos
    { modulo: 'documentos', acao: 'criar' },
    { modulo: 'documentos', acao: 'ler' },
    { modulo: 'documentos', acao: 'atualizar' },
    { modulo: 'documentos', acao: 'deletar' },
    { modulo: 'documentos', acao: 'exportar' },

    // Compras
    { modulo: 'compras', acao: 'criar' },
    { modulo: 'compras', acao: 'ler' },
    { modulo: 'compras', acao: 'atualizar' },
    { modulo: 'compras', acao: 'deletar' },
    { modulo: 'compras', acao: 'aprovar' },
    { modulo: 'compras', acao: 'exportar' },

    // Estoque
    { modulo: 'estoque', acao: 'criar' },
    { modulo: 'estoque', acao: 'ler' },
    { modulo: 'estoque', acao: 'atualizar' },
    { modulo: 'estoque', acao: 'deletar' },
    { modulo: 'estoque', acao: 'exportar' },

    // Ocorrências
    { modulo: 'ocorrencias', acao: 'criar' },
    { modulo: 'ocorrencias', acao: 'ler' },
    { modulo: 'ocorrencias', acao: 'atualizar' },
    { modulo: 'ocorrencias', acao: 'deletar' },
    { modulo: 'ocorrencias', acao: 'exportar' },

    // Agenda
    { modulo: 'agenda', acao: 'criar' },
    { modulo: 'agenda', acao: 'ler' },
    { modulo: 'agenda', acao: 'atualizar' },
    { modulo: 'agenda', acao: 'deletar' },
    { modulo: 'agenda', acao: 'exportar' },

    // Comunicação
    { modulo: 'comunicacao', acao: 'criar' },
    { modulo: 'comunicacao', acao: 'ler' },
    { modulo: 'comunicacao', acao: 'atualizar' },
    { modulo: 'comunicacao', acao: 'deletar' },
    { modulo: 'comunicacao', acao: 'exportar' }
  ];

  // Criar ou atualizar permissões
  for (const perm of permissoes) {
    try {
      const resultado = await prisma.permissao.upsert({
        where: {
          usuarioId_modulo_acao: {
            usuarioId: admin.id,
            modulo: perm.modulo,
            acao: perm.acao
          }
        },
        update: {
          concedido: true
        },
        create: {
          usuarioId: admin.id,
          modulo: perm.modulo,
          acao: perm.acao,
          concedido: true,
          dataConcessao: new Date()
        }
      });

      console.log(`✓ ${perm.modulo}:${perm.acao}`);
    } catch (error) {
      console.error(`✗ Erro ao adicionar ${perm.modulo}:${perm.acao}:`, error.message);
    }
  }

  // Contar permissões
  const totalPerms = await prisma.permissao.count({
    where: { usuarioId: admin.id, concedido: true }
  });

  console.log(`\n✅ Permissões concedidas: ${totalPerms}`);
  console.log(`👤 Usuário: ${admin.nome}`);
  console.log(`📧 Email: ${admin.email}`);

  console.log('\n🎉 Permissões configuradas com sucesso!\n');
}

seedPermissions()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
