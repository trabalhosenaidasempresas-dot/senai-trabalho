import Joi from 'joi';

export const criarDocumentoSchema = Joi.object({
  titulo: Joi.string().min(3).max(500).required(),
  categoria: Joi.string().min(2).max(100).required(),
  descricao: Joi.string().max(2000).allow('', null),
  assinado: Joi.boolean().optional(),
  deviceTimestamp: Joi.date().optional(),
  data: Joi.date().optional(),
  dataVencimento: Joi.date().optional(),
  fornecedor: Joi.string().max(255).allow('', null).optional(),
  fotos: Joi.any().optional(),
});

export const atualizarDocumentoSchema = Joi.object({
  titulo: Joi.string().min(3).max(500).optional(),
  categoria: Joi.string().min(2).max(100).optional(),
  descricao: Joi.string().max(2000).allow('', null).optional(),
  assinado: Joi.boolean().optional(),
  deviceTimestamp: Joi.date().optional(),
  data: Joi.date().optional(),
  dataVencimento: Joi.date().optional(),
  fornecedor: Joi.string().max(255).allow('', null).optional(),
  fotos: Joi.any().optional(),
});

export default { criarDocumentoSchema, atualizarDocumentoSchema };
