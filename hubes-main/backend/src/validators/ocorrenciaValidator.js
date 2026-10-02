import Joi from 'joi';

const relativeUri = Joi.string().trim().uri({ allowRelative: true });

export const criarOcorrenciaSchema = Joi.object({
  descricao: Joi.string().trim().required(),
  local: Joi.string().trim().required(),
  setor: Joi.string().trim().required(),
  prioridade: Joi.string().valid('Baixa', 'Média', 'Alta', 'Crítica').required(),
  fotos: Joi.alternatives().try(Joi.array().items(relativeUri), relativeUri).optional(),
  anexos: Joi.alternatives().try(Joi.array().items(relativeUri), relativeUri).optional(),
  deviceTimestamp: Joi.date().optional(),
});

export const atualizarOcorrenciaSchema = Joi.object({
  descricao: Joi.string().trim().optional(),
  local: Joi.string().trim().optional(),
  setor: Joi.string().trim().optional(),
  prioridade: Joi.string().valid('Baixa', 'Média', 'Alta', 'Crítica').optional(),
  fotos: Joi.alternatives().try(Joi.array().items(relativeUri), relativeUri).optional(),
  anexos: Joi.alternatives().try(Joi.array().items(relativeUri), relativeUri).optional(),
  deviceTimestamp: Joi.date().optional(),
}).min(1);

