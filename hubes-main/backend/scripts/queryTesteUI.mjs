import prisma from '../src/config/database.js';

const main = async () => {
  const results = await prisma.servico.findMany({
    where: { nome: { startsWith: 'Teste UI' } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  console.log(JSON.stringify(results, null, 2));
  await prisma.$disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
