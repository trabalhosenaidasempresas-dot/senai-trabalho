import prisma from '../config/database.js';

const DAYS_AHEAD = 30;

export const getSummary = async () => {
  const now = new Date();
  const aheadDate = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);

  // Users
  const totalUsers = await prisma.usuario.count({ where: { deletadoEm: null } });

  // Documents
  const totalDocuments = await prisma.documento.count({ where: { status: { not: 'Deletado' } } });

  // Stock
  const sumQuantidade = await prisma.produto.aggregate({ _sum: { quantidade: true } });
  const totalItemsStock = sumQuantidade._sum.quantidade || 0;
  const itensSemEstoque = await prisma.produto.count({ where: { quantidade: 0 } });
  // low stock: quantidade > 0 and quantidade <= estoqueMinimo
  const produtos = await prisma.produto.findMany({ select: { quantidade: true, estoqueMinimo: true } });
  let itensBaixoEstoque = 0;
  produtos.forEach((p) => {
    if (typeof p.quantidade === 'number' && typeof p.estoqueMinimo === 'number' && p.quantidade > 0 && p.quantidade <= p.estoqueMinimo) itensBaixoEstoque += 1;
  });

  // Maintenances / Services
  const totalManutencoes = await prisma.servico.count({ where: { deletadoEm: null } });
  const manutencoesVencidas = await prisma.servico.count({ where: { proximaManutencao: { lt: now }, deletadoEm: null } });
  const manutencoesProximas = await prisma.servico.count({ where: { proximaManutencao: { gte: now, lte: aheadDate }, deletadoEm: null } });

  // Contracts/Services by dataVencimento
  const contratosVigentes = await prisma.servico.count({ where: { dataVencimento: { gt: now }, deletadoEm: null } });
  const contratosVencendo = await prisma.servico.count({ where: { dataVencimento: { gte: now, lte: aheadDate }, deletadoEm: null } });
  const contratosVencidos = await prisma.servico.count({ where: { dataVencimento: { lt: now }, deletadoEm: null } });

  // Occurrences
  const totalOcorrencias = await prisma.ocorrencia.count({ where: { deletadoEm: null } });

  return {
    totalUsers,
    totalDocuments,
    totalItemsStock,
    itensBaixoEstoque,
    itensSemEstoque,
    totalManutencoes,
    manutencoesVencidas,
    manutencoesProximas,
    contratosVigentes,
    contratosVencendo,
    contratosVencidos,
    totalOcorrencias,
  };
};

export default { getSummary };
