import prisma from '../config/database.js';

import { ApiError } from '../utils/errors.js';

export const criarCompra = async (dados) => {
  try {
    return await prisma.compra.create({
      data: {
        ...dados,
        itens: dados.itens?.length
          ? { create: dados.itens }
          : undefined,
      },
      include: {
        solicitante: true,
        itens: true,
        documentosFiscais: true,
        historico: { orderBy: { createdAt: 'desc' } },
      },
    });
  } catch (err) {
    if (err && err.code === 'P2002' && err.meta && err.meta.target) {
      const field = Array.isArray(err.meta.target) ? err.meta.target[0] : err.meta.target;
      const friendly = field === 'numeroCompra' ? 'Número da compra' : field;
      throw ApiError.badRequest(`${friendly} já cadastrado`);
    }
    throw err;
  }
};

export const buscarCompraPorId = async (id) => {
  return prisma.compra.findFirst({
    where: { id, deletadoEm: null },
    include: {
      solicitante: true,
      itens: true,
      documentosFiscais: true,
      historico: { orderBy: { createdAt: 'desc' } },
    },
  });
};

export const listarCompras = async (
  skip = 0,
  take = 10,
  search = null,
  status = null,
  fornecedor = null,
  sortField = 'createdAt',
  sortOrder = 'desc',
) => {
  const where = { deletadoEm: null };

  if (search) {
    where.OR = [
      { numeroCompra: { contains: search, mode: 'insensitive' } },
      { fornecedor: { contains: search, mode: 'insensitive' } },
      { fornecedorEmail: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (fornecedor) {
    where.fornecedor = { contains: fornecedor, mode: 'insensitive' };
  }

  const allowedSortFields = ['numeroCompra', 'fornecedor', 'fornecedorEmail', 'quantidade', 'status', 'dataEntrega', 'createdAt'];
  const orderDirection = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
  const orderBy = allowedSortFields.includes(sortField) ? { [sortField]: orderDirection } : { createdAt: 'desc' };

  return prisma.compra.findMany({
    where,
    skip,
    take,
    include: {
      solicitante: true,
      itens: true,
      documentosFiscais: true,
    },
    orderBy,
  });
};

export const contarCompras = async (search = null, status = null, fornecedor = null) => {
  const where = { deletadoEm: null };

  if (search) {
    where.OR = [
      { numeroCompra: { contains: search, mode: 'insensitive' } },
      { fornecedor: { contains: search, mode: 'insensitive' } },
      { fornecedorEmail: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (fornecedor) {
    where.fornecedor = { contains: fornecedor, mode: 'insensitive' };
  }

  return prisma.compra.count({ where });
};

export const buscarCompraAutomaticaPorProduto = async (produtoId, statuses = ['Aguardando Compra']) => {
  return prisma.compra.findFirst({
    where: {
      deletadoEm: null,
      status: { in: statuses },
      observacao: {
        contains: `AUTO_ESTOQUE:${produtoId}`,
        mode: 'insensitive',
      },
    },
  });
};

export const atualizarCompra = async (id, dados) => {
  const updateData = {
    ...dados,
  };

  if (dados.itens) {
    updateData.itens = {
      deleteMany: {},
      create: dados.itens,
    };
  }

  return prisma.compra.update({
    where: { id },
    data: updateData,
    include: {
      solicitante: true,
      itens: true,
      documentosFiscais: true,
      historico: { orderBy: { createdAt: 'desc' } },
    },
  });
};

export const softDeleteCompra = async (id) => {
  return prisma.compra.update({
    where: { id },
    data: { deletadoEm: new Date() },
  });
};

export const adicionarHistorico = async (compraId, acao, descricao, usuarioId = null, usuarioEmail = null, endereco = null) => {
  return prisma.compraHistorico.create({
    data: {
      compraId,
      acao,
      descricao,
      usuarioId,
      usuarioEmail,
      endereco,
    },
  });
};

export const listarHistorico = async (compraId) => {
  return prisma.compraHistorico.findMany({
    where: { compraId },
    orderBy: { createdAt: 'desc' },
  });
};

export const adicionarDocumentoFiscal = async (compraId, dados) => {
  return prisma.compraDocumentoFiscal.create({
    data: {
      compraId,
      ...dados,
    },
  });
};

export const buscarDocumentoFiscalPorId = async (id) => {
  return prisma.compraDocumentoFiscal.findUnique({ where: { id } });
};

export const listarDocumentosFiscais = async (compraId) => {
  return prisma.compraDocumentoFiscal.findMany({
    where: { compraId },
    orderBy: { createdAt: 'desc' },
  });
};

export const deletarDocumentoFiscal = async (id) => {
  return prisma.compraDocumentoFiscal.delete({
    where: { id },
  });
};

// Fluxo de Aprovação
export const obterFluxoAprovacao = async (compraId) => {
  return prisma.aprovacaoCompra.findMany({
    where: { compraId },
    include: { usuario: true },
    orderBy: { nivel: 'asc' },
  });
};

export const atualizarStatusAprovacao = async (compraId, nivel, status, usuarioId, motivo, dataAprovacao) => {
  return prisma.aprovacaoCompra.updateMany({
    where: { compraId, nivel },
    data: {
      statusAprovacao: status,
      usuarioId,
      motivo,
      dataAprovacao,
    },
  });
};

// Fornecedores
export const criarFornecedor = async (dados) => {
  return prisma.fornecedor.create({
    data: dados,
  });
};

export const buscarFornecedorPorId = async (id) => {
  return prisma.fornecedor.findUnique({
    where: { id },
  });
};

export const buscarFornecedorPorCnpj = async (cnpj) => {
  return prisma.fornecedor.findUnique({
    where: { cnpj },
  });
};

export const listarFornecedores = async (skip = 0, take = 10, search = null, status = 'Ativo') => {
  const where = { status };

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { nomeFantasia: { contains: search, mode: 'insensitive' } },
      { cnpj: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.fornecedor.findMany({
    where,
    skip,
    take,
    orderBy: { nome: 'asc' },
  });
};

export const contarFornecedores = async (search = null, status = 'Ativo') => {
  const where = { status };

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { nomeFantasia: { contains: search, mode: 'insensitive' } },
      { cnpj: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.fornecedor.count({ where });
};

export const atualizarFornecedor = async (id, dados) => {
  return prisma.fornecedor.update({
    where: { id },
    data: dados,
  });
};

// Centros de Custo
export const listarCentrosCusto = async (skip = 0, take = 10, search = null) => {
  const where = { ativo: true };

  if (search) {
    where.OR = [
      { codigo: { contains: search, mode: 'insensitive' } },
      { nome: { contains: search, mode: 'insensitive' } },
      { departamento: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.centroCusto.findMany({
    where,
    skip,
    take,
    orderBy: { codigo: 'asc' },
  });
};

export const contarCentrosCusto = async (search = null) => {
  const where = { ativo: true };

  if (search) {
    where.OR = [
      { codigo: { contains: search, mode: 'insensitive' } },
      { nome: { contains: search, mode: 'insensitive' } },
      { departamento: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.centroCusto.count({ where });
};

export const buscarCentroCustoPorId = async (id) => {
  return prisma.centroCusto.findUnique({
    where: { id },
  });
};

// Estatísticas
export const obterEstatisticasCompras = async () => {
  const [total, pendentes, aprovadas, canceladas, valor] = await Promise.all([
    prisma.compra.count({ where: { deletadoEm: null } }),
    prisma.compra.count({ where: { deletadoEm: null, status: 'Solicitação' } }),
    prisma.compra.count({ where: { deletadoEm: null, status: 'Compra' } }),
    prisma.compra.count({ where: { deletadoEm: null, status: 'Cancelada' } }),
    prisma.compra.aggregate({
      where: { deletadoEm: null },
      _sum: { valor: true },
    }),
  ]);

  return {
    totalCompras: total,
    comprasPendentes: pendentes,
    comprasAprovadas: aprovadas,
    comprasCanceladas: canceladas,
    valorTotal: valor._sum.valor || 0,
  };
};

export const obterEstatisticasPorStatus = async () => {
  return prisma.compra.groupBy({
    by: ['status'],
    where: { deletadoEm: null },
    _count: true,
    _sum: { valor: true },
    orderBy: { status: 'asc' },
  });
};

export const obterEstatisticasPorCentroCusto = async () => {
  // Centro de custo foi removido do modelo de compra.
  // Retornamos lista vazia para manter compatibilidade de rota sem falhar.
  return [];
};

export const listarComprasRelatorio = async (
  dataInicio = null,
  dataFim = null,
  status = null,
  fornecedor = null
) => {
  const where = { deletadoEm: null };

  if (dataInicio || dataFim) {
    where.createdAt = {};
    if (dataInicio) where.createdAt.gte = new Date(dataInicio);
    if (dataFim) where.createdAt.lte = new Date(dataFim);
  }

  if (status) where.status = status;
  if (fornecedor) where.fornecedor = { contains: fornecedor, mode: 'insensitive' };

  return prisma.compra.findMany({
    where,
    include: {
      solicitante: true,
      itens: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};
