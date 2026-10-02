import * as produtoService from '../services/produtoService.js';
import * as compraService from '../services/compraService.js';

export const listar = async (req, res, next) => {
  try {
    const { pagina = 1, limite = 10, search, categoria, localizacao, sortField, sortOrder } = req.query;
    const resultado = await produtoService.listarProdutos(
      parseInt(pagina),
      parseInt(limite),
      search,
      categoria,
      localizacao,
      sortField,
      sortOrder,
    );

    res.json({ success: true, ...resultado });
  } catch (error) {
    next(error);
  }
};

export const criar = async (req, res, next) => {
  try {
    const produto = await produtoService.criarProduto(req.body);
    try {
      await compraService.criarCompraDeEstoqueSeNecessario(produto, req.user);
    } catch (err) {
      console.error('Erro ao criar compra automática de estoque:', err);
    }
    res.status(201).json({ success: true, message: 'Produto criado com sucesso', data: produto });
  } catch (error) {
    next(error);
  }
};

export const obter = async (req, res, next) => {
  try {
    const produto = await produtoService.obterProduto(req.params.id);
    res.json({ success: true, data: produto });
  } catch (error) {
    next(error);
  }
};

export const atualizar = async (req, res, next) => {
  try {
    const produto = await produtoService.atualizarProduto(req.params.id, req.body);
    try {
      await compraService.criarCompraDeEstoqueSeNecessario(produto, req.user);
    } catch (err) {
      console.error('Erro ao criar compra automática de estoque:', err);
    }
    res.json({ success: true, message: 'Produto atualizado com sucesso', data: produto });
  } catch (error) {
    next(error);
  }
};

export const listarMovimentacoes = async (req, res, next) => {
  try {
    const movimentacoes = await produtoService.listarMovimentacoes(req.params.id);
    res.json({ success: true, data: movimentacoes });
  } catch (error) {
    next(error);
  }
};

export const criarMovimentacao = async (req, res, next) => {
  try {
    const movimentacao = await produtoService.criarMovimentacao(req.params.id, req.body, req.user);
    res.status(201).json({ success: true, message: 'Movimentação registrada com sucesso', data: movimentacao });
  } catch (error) {
    next(error);
  }
};

export const deletar = async (req, res, next) => {
  try {
    await produtoService.deletarProduto(req.params.id);
    res.json({ success: true, message: 'Produto deletado com sucesso' });
  } catch (error) {
    next(error);
  }
};
