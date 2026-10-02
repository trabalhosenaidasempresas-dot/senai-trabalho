import prisma from '../src/config/database.js';

const main = async () => {
  const columns = await prisma.$queryRawUnsafe(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'servicos' ORDER BY ordinal_position`);
  console.log('columns:', JSON.stringify(columns, null, 2));

  const rows = await prisma.servico.findMany({ take: 1 });
  console.log('sample row keys:', rows.length ? Object.keys(rows[0]) : 'no rows');
  console.log(JSON.stringify(rows, null, 2));

  await prisma.$disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});