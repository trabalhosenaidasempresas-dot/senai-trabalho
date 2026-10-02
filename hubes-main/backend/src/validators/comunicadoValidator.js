import Joi from 'joi';

export const criarComunicadoSchema = Joi.object({
  titulo: Joi.string().trim().required(),
  conteudo: Joi.string().trim().required(),
  tipo: Joi.string().trim().required(),
  status: Joi.string().valid('Ativo', 'Arquivado', 'Deletado').default('Ativo'),
  dataVencimento: Joi.date().allow(null),
  anexos: Joi.string().trim().allow('', null),
  deviceTimestamp: Joi.date().optional(),
});

export const atualizarComunicadoSchema = Joi.object({
  titulo: Joi.string().trim().optional(),
  conteudo: Joi.string().trim().optional(),
  tipo: Joi.string().trim().optional(),
  status: Joi.string().valid('Ativo', 'Arquivado', 'Deletado').optional(),
  dataVencimento: Joi.date().allow(null).optional(),
  anexos: Joi.string().trim().allow('', null).optional(),
  deviceTimestamp: Joi.date().optional(),
}).min(1);
