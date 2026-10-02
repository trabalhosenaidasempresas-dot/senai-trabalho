import * as produtoRepository from '../repositories/produtoRepository.js';
import * as compraService from './compraService.js';

import { ApiError } from '../utils/errors.js';

export const criarProduto = async (dados) => {
  if (!dados.nome || !dados.codigo || !dados.categoria || !dados.unidade) {
    throw ApiError.badRequest('Nome, código, categoria e unidade são obrigatórios');
  }
  try {
    const deviceTimestamp = dados.deviceTimestamp ? new Date(dados.deviceTimestamp) : null;
    return await produtoRepository.criarProduto({
      ...dados,
      deviceTimestamp: deviceTimestamp && !Number.isNaN(deviceTimestamp.getTime()) ? deviceTimestamp : undefined,
    });
  } catch (err) {
    // Prisma unique constraint
    if (err && err.code === 'P2002' && err.meta && err.meta.target) {
      const field = Array.isArray(err.meta.target) ? err.meta.target[0] : err.meta.target;
      const friendly = field === 'codigo' ? 'Código' : field;
      throw ApiError.badRequest(`${friendly} já cadastrado`);
    }
    throw ApiError.internal();
  }
};

export const obterProduto = async (id) => {
  const produto = await produtoRepository.buscarProdutoPorId(id);
  if (!produto) throw new Error('Produto não encontrado');
  return produto;
};

export const listarProdutos = async (
  pagina = 1,
  limite = 10,
  search = null,
  categoria = null,
  localizacao = null,
  sortField = 'createdAt',
  sortOrder = 'desc',
) => {
  const skip = (pagina - 1) * limite;
  const produtos = await produtoRepository.listarProdutos(skip, limite, search, categoria, localizacao, sortField, sortOrder);
  const total = await produtoRepository.contarProdutos(search, categoria, localizacao);

  return {
    produtos,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    },
  };
};

export const atualizarProduto = async (id, dados) => {
  const produto = await produtoRepository.buscarProdutoPorId(id);
  if (!produto) throw new Error('Produto não encontrado');
  const deviceTimestamp = dados.deviceTimestamp ? new Date(dados.deviceTimestamp) : null;
  return produtoRepository.atualizarProduto(id, {
    ...dados,
    deviceTimestamp: deviceTimestamp && !Number.isNaN(deviceTimestamp.getTime()) ? deviceTimestamp : undefined,
  });
};

export const listarMovimentacoes = async (produtoId) => {
  const produto = await produtoRepository.buscarProdutoPorId(produtoId);
  if (!produto) throw new Error('Produto não encontrado');
  return produtoRepository.listarMovimentacoes(produtoId);
};

export const criarMovimentacao = async (produtoId, dados, usuario) => {
  const produto = await produtoRepository.buscarProdutoPorId(produtoId);
  if (!produto) throw new Error('Produto não encontrado');

  const quantidade = Number(dados.quantidade);
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw ApiError.badRequest('Quantidade de movimentação deve ser um número inteiro maior que zero');
  }

  const tipo = dados.tipo;
  if (!['Entrada', 'Saida', 'Reposicao'].includes(tipo)) {
    throw ApiError.badRequest('Tipo de movimentação inválido');
  }

  let novaQuantidade = produto.quantidade;
  if (tipo === 'Saida') {
    novaQuantidade = produto.quantidade - quantidade;
    if (novaQuantidade < 0) {
      throw ApiError.badRequest('Quantidade insuficiente para esta saída');
    }
  } else {
    novaQuantidade = produto.quantidade + quantidade;
  }

  const dataMovimentacao = dados.data ? new Date(dados.data) : new Date();
  if (Number.isNaN(dataMovimentacao.getTime())) {
    throw ApiError.badRequest('Data de movimentação inválida');
  }

  const observacao = dados.observacao?.trim() || `${tipo} de ${quantidade} em ${produto.nome}`;

  const updatedProduct = await produtoRepository.atualizarProduto(produtoId, {
    quantidade: novaQuantidade,
    ultimaReposicao: tipo === 'Reposicao' ? dataMovimentacao : produto.ultimaReposicao,
  });

  const movimentacao = await produtoRepository.criarMovimentacao({
    produtoId,
    usuarioId: usuario?.id || null,
    tipo,
    quantidade,
    motivo: observacao,
    createdAt: dataMovimentacao,
  });

  try {
    await compraService.criarCompraDeEstoqueSeNecessario(updatedProduct, usuario);
  } catch (err) {
    console.error('Erro ao verificar compra automática após movimentação de estoque:', err);
  }

  return movimentacao;
};

export const deletarProduto = async (id) => {
  const produto = await produtoRepository.buscarProdutoPorId(id);
  if (!produto) throw new Error('Produto não encontrado');
  return produtoRepository.deletarProduto(id);
};
