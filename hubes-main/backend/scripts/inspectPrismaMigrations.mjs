import prisma from '../src/config/database.js';

const main = async () => {
  const migrationColumns = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = '_prisma_migrations'
    ORDER BY ordinal_position
  `);
  console.log('migration table columns:', JSON.stringify(migrationColumns, null, 2));

  const migrations = await prisma.$queryRawUnsafe(`
    SELECT migration_name, finished_at, started_at, checksum, logs
    FROM _prisma_migrations
    ORDER BY finished_at DESC NULLS LAST
    LIMIT 20
  `);
  console.log('migrations:', JSON.stringify(migrations, null, 2));

  const serviceColumns = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'servicos'
    ORDER BY ordinal_position
  `);
  console.log('servicos columns:', JSON.stringify(serviceColumns, null, 2));

  await prisma.$disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});