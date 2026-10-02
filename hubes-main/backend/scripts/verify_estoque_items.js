import prisma from '../src/config/database.js';

const codigos = [
  'CD-200ML', 'TOUCA-TNT', 'LUVA-LATEX', 'GUARDANAPO', 'CD-80ML', 'ACUCAR-SACHE-50G', 'CAFE-500G', 'ADOÇANTE-200ML',
  'SABONETE-LIQ-5L', 'ALCOOL-GEL-500G', 'PAPEL-HIG-300M', 'PAPEL-TOALHA-20X200', 'SABONETE-BARRA-1KG',
  'LIMPA-VIDRO-500ML', 'LIMPA-ALUMINIO-500ML', 'SAPONACE-300ML', 'LUSTRA-MOVEIS-200ML', 'MULTIUSO-VEJA',
  'LIMPA-PORCELANATO-2L', 'ALCOOL-LIQ-5L', 'SACO-LIXO-200L', 'SACO-60L', 'SACO-ALVEJADO', 'FLANELA-M',
];

const main = async () => {
  const products = await prisma.produto.findMany({
    where: { codigo: { in: codigos } },
    orderBy: { nome: 'asc' },
  });

  console.log('Encontrados:', products.length);
  products.forEach((p) => {
    console.log(`${p.nome} | codigo=${p.codigo} | categoria=${p.categoria} | quantidade=${p.quantidade} | localizacao=${p.localizacao} | descricao=${p.descricao}`);
  });

  await prisma.$disconnect();
};

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});