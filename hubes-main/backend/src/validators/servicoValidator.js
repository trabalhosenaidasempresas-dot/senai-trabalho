import Joi from 'joi';

const categorias = [
  'Seguranca',
  'Limpeza',
  'Manutencao',
  'Recepcao',
  'Bombeiros',
  'Ar condicionado',
  'Elevador',
  'Extintores',
  'Bomba hidraulica',
  'Caixa d\'agua',
  'Dedetizacao',
  'Limpeza de esgoto',
  'Outros',
];

const tiposServico = ['Contratado', 'Manutenção'];

export const criarServicoSchema = Joi.object({
  tipoServico: Joi.string().valid(...tiposServico).required(),
  nome: Joi.string().trim().required(),
  equipamento: Joi.string().trim().allow('', null),
  escala: Joi.string().trim().allow('', null),
  categoria: Joi.string().valid(...categorias).allow('', null),
  fornecedor: Joi.string().trim().allow('', null),
  documentoId: Joi.string().trim().allow('', null),
  dataInicio: Joi.date().allow(null),
  dataVencimento: Joi.date().allow(null),
  periodicidade: Joi.string().trim().allow('', null),
  ultimaManutencao: Joi.alternatives().try(Joi.date(), Joi.string().trim().allow('')).allow(null),
  proximaManutencao: Joi.date().allow(null),
  status: Joi.string().trim().allow('', null),
  observacoes: Joi.string().trim().allow('', null),
  fotos: Joi.alternatives().try(Joi.array().items(Joi.string().uri({ allowRelative: true })), Joi.string().trim()).optional(),
  anexos: Joi.alternatives().try(Joi.array().items(Joi.string().uri({ allowRelative: true })), Joi.string().trim()).optional(),
});

export const atualizarServicoSchema = Joi.object({
  tipoServico: Joi.string().valid(...tiposServico).optional(),
  nome: Joi.string().trim().optional(),
  equipamento: Joi.string().trim().allow('', null).optional(),
  escala: Joi.string().trim().allow('', null).optional(),
  categoria: Joi.string().valid(...categorias).allow('', null).optional(),
  fornecedor: Joi.string().trim().allow('', null).optional(),
  documentoId: Joi.string().trim().allow('', null).optional(),
  dataInicio: Joi.date().allow(null).optional(),
  dataVencimento: Joi.date().allow(null).optional(),
  periodicidade: Joi.string().trim().allow('', null).optional(),
  ultimaManutencao: Joi.alternatives().try(Joi.date(), Joi.string().trim().allow('')).allow(null).optional(),
  proximaManutencao: Joi.date().allow(null).optional(),
  status: Joi.string().trim().allow('', null).optional(),
  observacoes: Joi.string().trim().allow('', null).optional(),
  fotos: Joi.alternatives().try(Joi.array().items(Joi.string().uri({ allowRelative: true })), Joi.string().trim()).optional(),
  anexos: Joi.alternatives().try(Joi.array().items(Joi.string().uri({ allowRelative: true })), Joi.string().trim()).optional(),
}).min(1);
