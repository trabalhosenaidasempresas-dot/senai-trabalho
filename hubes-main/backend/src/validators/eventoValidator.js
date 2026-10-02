import Joi from 'joi';

export const criarEventoSchema = Joi.object({
  titulo: Joi.string().trim().required(),
  descricao: Joi.string().trim().allow('', null),
  dataInicio: Joi.date().required(),
  dataFim: Joi.date().greater(Joi.ref('dataInicio')).allow(null),
  local: Joi.string().trim().allow('', null),
  tipo: Joi.string().trim().required(),
  status: Joi.string().valid('Ativo', 'Concluído', 'Cancelado').default('Ativo'),
  participantes: Joi.string().trim().allow('', null),
  deviceTimestamp: Joi.date().optional(),
});

export const atualizarEventoSchema = Joi.object({
  titulo: Joi.string().trim().optional(),
  descricao: Joi.string().trim().allow('', null).optional(),
  dataInicio: Joi.date().optional(),
  dataFim: Joi.date().greater(Joi.ref('dataInicio')).allow(null).optional(),
  local: Joi.string().trim().allow('', null).optional(),
  tipo: Joi.string().trim().optional(),
  status: Joi.string().valid('Ativo', 'Concluído', 'Cancelado').optional(),
  participantes: Joi.string().trim().allow('', null).optional(),
  deviceTimestamp: Joi.date().optional(),
}).min(1);
