import pkg from '@prisma/client';
import bcrypt from 'bcrypt';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Limpar dados existentes (opcional)
  // await prisma.usuario.deleteMany({});

  // Criar usuários padrão
  const adminPassword = await bcrypt.hash('admin123', 10);
  const gestorPassword = await bcrypt.hash('gestor123', 10);
  const servidorPassword = await bcrypt.hash('servidor123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@secult.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@secult.com',
      senha: adminPassword,
      telefone: '(27) 3131-2000',
      setor: 'TI',
      perfil: 'Administrador',
      status: 'Ativo',
    },
  });

  const gestor = await prisma.usuario.upsert({
    where: { email: 'gestor@secult.com' },
    update: {},
    create: {
      nome: 'Gestor',
      email: 'gestor@secult.com',
      senha: gestorPassword,
      telefone: '(27) 3131-2001',
      setor: 'Gestão',
      perfil: 'Gestor',
      status: 'Ativo',
    },
  });

  const servidor = await prisma.usuario.upsert({
    where: { email: 'servidor@secult.com' },
    update: {},
    create: {
      nome: 'Servidor',
      email: 'servidor@secult.com',
      senha: servidorPassword,
      telefone: '(27) 3131-2002',
      setor: 'Administrativo',
      perfil: 'Servidor',
      status: 'Ativo',
    },
  });

  console.log(`✓ Usuários criados: ${admin.nome}, ${gestor.nome}, ${servidor.nome}`);

  console.log('✓ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
