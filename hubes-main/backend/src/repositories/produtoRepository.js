import prisma from '../config/database.js';

import { ApiError } from '../utils/errors.js';

export const criarProduto = async (dados) => {
  try {
    return await prisma.produto.create({ data: dados });
  } catch (err) {
    if (err && err.code === 'P2002' && err.meta && err.meta.target) {
      const field = Array.isArray(err.meta.target) ? err.meta.target[0] : err.meta.target;
      const friendly = field === 'codigo' ? 'Código' : field;
      throw ApiError.badRequest(`${friendly} já cadastrado`);
    }
    throw err;
  }
};
export const buscarProdutoPorId = async (id) => prisma.produto.findUnique({
  where: { id },
  include: {
    movimentacoes: {
      orderBy: { createdAt: 'desc' },
      take: 50,
    },
  },
});
export const listarProdutos = async (
  skip = 0,
  take = 10,
  search = null,
  categoria = null,
  localizacao = null,
  sortField = 'createdAt',
  sortOrder = 'desc',
) => {
  const where = {};

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { codigo: { contains: search, mode: 'insensitive' } },
      { categoria: { contains: search, mode: 'insensitive' } },
      { localizacao: { contains: search, mode: 'insensitive' } },
      { descricao: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoria) where.categoria = categoria;
  if (localizacao) where.localizacao = localizacao;

  const allowedSortFields = ['nome', 'codigo', 'categoria', 'quantidade', 'preco', 'ativo', 'ultimaReposicao', 'createdAt'];
  const orderDirection = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
  const orderBy = allowedSortFields.includes(sortField) ? { [sortField]: orderDirection } : { createdAt: 'desc' };

  return prisma.produto.findMany({ where, skip, take, orderBy });
};
export const contarProdutos = async (search = null, categoria = null, localizacao = null) => {
  const where = {};

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { codigo: { contains: search, mode: 'insensitive' } },
      { categoria: { contains: search, mode: 'insensitive' } },
      { localizacao: { contains: search, mode: 'insensitive' } },
      { descricao: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoria) where.categoria = categoria;
  if (localizacao) where.localizacao = localizacao;

  return prisma.produto.count({ where });
};
export const atualizarProduto = async (id, dados) => prisma.produto.update({ where: { id }, data: dados });
export const deletarProduto = async (id) => prisma.produto.delete({ where: { id } });
export const listarMovimentacoes = async (produtoId) => prisma.movimentacaoEstoque.findMany({
  where: { produtoId },
  orderBy: { createdAt: 'desc' },
});
export const criarMovimentacao = async (dados) => prisma.movimentacaoEstoque.create({ data: dados });
