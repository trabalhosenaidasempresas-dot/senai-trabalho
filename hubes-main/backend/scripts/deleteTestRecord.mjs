import prismaPkg from '@prisma/client';
const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

const run = async () => {
  console.log('Deletando produto P-102 (se existir)...');
  await prisma.produto.deleteMany({ where: { codigo: 'P-102' } });
  console.log('Operação concluída.');
  await prisma.$disconnect();
};

run().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
