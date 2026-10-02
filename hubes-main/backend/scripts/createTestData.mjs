import prismaPkg from '@prisma/client';
import bcrypt from 'bcrypt';
const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

const run = async () => {
  console.log('Criando dados de teste...');

  // Produtos
  const p1 = await prisma.produto.upsert({ where: { codigo: 'P-100' }, update: {}, create: { nome: 'Produto A', codigo: 'P-100', categoria: 'Geral', unidade: 'Un', quantidade: 100, estoqueMinimo: 10 } });
  const p2 = await prisma.produto.upsert({ where: { codigo: 'P-101' }, update: {}, create: { nome: 'Produto B', codigo: 'P-101', categoria: 'Geral', unidade: 'Un', quantidade: 5, estoqueMinimo: 10 } });
  const p3 = await prisma.produto.upsert({ where: { codigo: 'P-102' }, update: {}, create: { nome: 'Produto C', codigo: 'P-102', categoria: 'Geral', unidade: 'Un', quantidade: 0, estoqueMinimo: 5 } });

  // Servicos (manutencoes/contratos)
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in40 = new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000);
  const past = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const admin = await prisma.usuario.findFirst({ where: { email: 'admin@secult.com' } });
  const adminId = admin ? admin.id : (await prisma.usuario.create({ data: { nome: 'Admin Test', email: 'admin2@secult.com', senha: await bcrypt.hash('admin123', 10) } })).id;

  const s1 = await prisma.servico.upsert({ where: { numeroServico: 'S-100' }, update: {}, create: { numeroServico: 'S-100', nome: 'Manutenção A', categoria: 'Manutenção', fornecedor: 'Fornecedor X', dataInicio: now, dataVencimento: in40, periodicidade: 'Anual', proximaManutencao: in40, status: 'Ativo', responsavelId: adminId, responsavelEmail: admin?.email || 'admin2@secult.com' } });
  const s2 = await prisma.servico.upsert({ where: { numeroServico: 'S-101' }, update: {}, create: { numeroServico: 'S-101', nome: 'Manutenção B', categoria: 'Manutenção', fornecedor: 'Fornecedor Y', dataInicio: now, dataVencimento: in7, periodicidade: 'Mensal', proximaManutencao: in7, status: 'Ativo', responsavelId: adminId, responsavelEmail: admin?.email || 'admin2@secult.com' } });
  const s3 = await prisma.servico.upsert({ where: { numeroServico: 'S-102' }, update: {}, create: { numeroServico: 'S-102', nome: 'Manutenção C', categoria: 'Manutenção', fornecedor: 'Fornecedor Z', dataInicio: past, dataVencimento: past, periodicidade: 'Mensal', proximaManutencao: past, status: 'Ativo', responsavelId: adminId, responsavelEmail: admin?.email || 'admin2@secult.com' } });

  // Ocorrencia
  const o1 = await prisma.ocorrencia.upsert({ where: { numeroOcorrencia: 'O-100' }, update: {}, create: { numeroOcorrencia: 'O-100', titulo: 'Ocorrência teste', descricao: 'Descrição', local: 'Local A', setor: 'Setor X', responsavelId: adminId, prioridade: 'Média', status: 'Aberto' } });

  console.log('Dados de teste criados.');
  await prisma.$disconnect();
};

run().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
