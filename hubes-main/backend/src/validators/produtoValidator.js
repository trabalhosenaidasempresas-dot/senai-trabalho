import Joi from 'joi';

export const criarProdutoSchema = Joi.object({
  nome: Joi.string().trim().required(),
  codigo: Joi.string().trim().required(),
  categoria: Joi.string().trim().required(),
  unidade: Joi.string().trim().required(),
  quantidade: Joi.number().integer().min(0).required(),
  estoqueMinimo: Joi.number().integer().min(0).required(),
  estoqueMaximo: Joi.number().integer().min(0).allow(null),
  localizacao: Joi.string().trim().allow('', null),
  descricao: Joi.string().trim().allow('', null),
  preco: Joi.number().positive().allow(null),
  fornecedor: Joi.string().trim().allow('', null),
  ativo: Joi.boolean().optional(),
  deviceTimestamp: Joi.date().optional(),
});

export const atualizarProdutoSchema = Joi.object({
  nome: Joi.string().trim().optional(),
  codigo: Joi.string().trim().optional(),
  categoria: Joi.string().trim().optional(),
  unidade: Joi.string().trim().optional(),
  quantidade: Joi.number().integer().min(0).optional(),
  estoqueMinimo: Joi.number().integer().min(0).optional(),
  estoqueMaximo: Joi.number().integer().min(0).allow(null).optional(),
  localizacao: Joi.string().trim().allow('', null).optional(),
  descricao: Joi.string().trim().allow('', null).optional(),
  preco: Joi.number().positive().allow(null).optional(),
  fornecedor: Joi.string().trim().allow('', null).optional(),
  ativo: Joi.boolean().optional(),
  deviceTimestamp: Joi.date().optional(),
}).min(1);

export const criarMovimentacaoSchema = Joi.object({
  tipo: Joi.string().valid('Entrada', 'Saida', 'Reposicao').required(),
  quantidade: Joi.number().integer().min(1).required(),
  data: Joi.date().optional(),
  observacao: Joi.string().trim().allow('', null).optional(),
});
