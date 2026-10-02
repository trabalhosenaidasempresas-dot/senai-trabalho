import Joi from 'joi';

const compraItemSchema = Joi.object({
  descricao: Joi.string().trim().required(),
  quantidade: Joi.number().integer().positive().required(),
  valorUnitario: Joi.number().precision(2).min(0).required(),
  especificacoes: Joi.string().trim().allow('', null),
});

export const criarCompraSchema = Joi.object({
  fornecedor: Joi.string().trim().required(),
  fornecedorEmail: Joi.string().email().required(),
  quantidade: Joi.number().integer().positive().optional(),
  observacao: Joi.string().trim().allow('', null),
  dataEntrega: Joi.date().allow(null),
  deviceTimestamp: Joi.date().optional(),
  itens: Joi.array().items(compraItemSchema).optional(),
});

export const atualizarCompraSchema = Joi.object({
  numeroCompra: Joi.string().trim().optional(),
  fornecedor: Joi.string().trim().optional(),
  fornecedorEmail: Joi.string().email().optional(),
  quantidade: Joi.number().integer().positive().optional(),
  observacao: Joi.string().trim().allow('', null).optional(),
  status: Joi.string().valid('Em análise', 'Aguardando Compra', 'Solicitação', 'Aprovação', 'Cotação', 'Compra', 'Recebimento', 'Entrega', 'Cancelada').optional(),
  dataEntrega: Joi.date().allow(null).optional(),
  deviceTimestamp: Joi.date().optional(),
  aprovadoPorId: Joi.string().trim().optional(),
  aprovadoPor: Joi.string().trim().optional(),
  dataAprovacao: Joi.date().allow(null).optional(),
  motivoRejeicao: Joi.string().trim().allow('', null).optional(),
  itens: Joi.array().items(compraItemSchema).optional(),
}).min(1);

export const aprovarCompraSchema = Joi.object({
  aprovado: Joi.boolean().required(),
  motivoRejeicao: Joi.when('aprovado', {
    is: false,
    then: Joi.string().trim().required(),
    otherwise: Joi.string().trim().allow('', null),
  }),
});

export const documentoFiscalSchema = Joi.object({
  numeroNota: Joi.string().trim().allow('', null).optional(),
  dataEmissao: Joi.date().allow(null).optional(),
  valor: Joi.number().precision(2).min(0).optional(),
  tipo: Joi.string().trim().allow('', null).optional(),
});

export const fluxoAprovacaoSchema = Joi.object({
  nivel: Joi.number().integer().positive().required(),
  motivo: Joi.string().trim().allow('', null).optional(),
});

export const rejeicaoFluxoSchema = Joi.object({
  nivel: Joi.number().integer().positive().required(),
  motivo: Joi.string().trim().required(),
});

export const criarFornecedorSchema = Joi.object({
  nome: Joi.string().trim().required(),
  nomeFantasia: Joi.string().trim().allow('', null),
  cnpj: Joi.string().trim().length(14).required(),
  cpf: Joi.string().trim().length(11).allow('', null),
  email: Joi.string().email().required(),
  telefone: Joi.string().trim().allow('', null),
  whatsapp: Joi.string().trim().allow('', null),
  endereco: Joi.string().trim().allow('', null),
  numero: Joi.string().trim().allow('', null),
  complemento: Joi.string().trim().allow('', null),
  bairro: Joi.string().trim().allow('', null),
  cidade: Joi.string().trim().allow('', null),
  estado: Joi.string().trim().max(2).allow('', null),
  cep: Joi.string().trim().allow('', null),
  contato: Joi.string().trim().allow('', null),
  cargo: Joi.string().trim().allow('', null),
  notas: Joi.string().trim().allow('', null),
});

export const atualizarFornecedorSchema = Joi.object({
  nome: Joi.string().trim().optional(),
  nomeFantasia: Joi.string().trim().allow('', null).optional(),
  cnpj: Joi.string().trim().length(14).optional(),
  cpf: Joi.string().trim().length(11).allow('', null).optional(),
  email: Joi.string().email().optional(),
  telefone: Joi.string().trim().allow('', null).optional(),
  whatsapp: Joi.string().trim().allow('', null).optional(),
  endereco: Joi.string().trim().allow('', null).optional(),
  numero: Joi.string().trim().allow('', null).optional(),
  complemento: Joi.string().trim().allow('', null).optional(),
  bairro: Joi.string().trim().allow('', null).optional(),
  cidade: Joi.string().trim().allow('', null).optional(),
  estado: Joi.string().trim().max(2).allow('', null).optional(),
  cep: Joi.string().trim().allow('', null).optional(),
  contato: Joi.string().trim().allow('', null).optional(),
  cargo: Joi.string().trim().allow('', null).optional(),
  ativo: Joi.boolean().optional(),
  status: Joi.string().valid('Ativo', 'Inativo', 'Bloqueado', 'Removido').optional(),
  notas: Joi.string().trim().allow('', null).optional(),
}).min(1);
