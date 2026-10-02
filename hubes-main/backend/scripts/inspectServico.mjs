import prisma from '../src/config/database.js';

const main = async () => {
  const sample = await prisma.servico.findMany({
    take: 5,
    select: {
      id: true,
      tipoServico: true,
      nome: true,
      dataVencimento: true,
      proximaManutencao: true,
    },
  });
  console.log(JSON.stringify(sample, null, 2));
  await prisma.$disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
