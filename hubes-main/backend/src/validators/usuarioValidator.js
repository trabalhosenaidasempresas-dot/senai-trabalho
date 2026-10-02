import Joi from 'joi';

export const criarUsuarioSchema = Joi.object({
  nome: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required(),
  telefone: Joi.string().allow('', null),
  setor: Joi.string().allow('', null),
  perfil: Joi.string().valid('Administrador', 'Gestor', 'Servidor', 'Visitante').required(),
  status: Joi.string().valid('Ativo', 'Inativo').optional(),
});

export const atualizarUsuarioSchema = Joi.object({
  nome: Joi.string().min(3).max(255).optional(),
  email: Joi.string().email().optional(),
  senha: Joi.string().min(6).optional(),
  telefone: Joi.string().allow('', null).optional(),
  setor: Joi.string().allow('', null).optional(),
  perfil: Joi.string().valid('Administrador', 'Gestor', 'Servidor', 'Visitante').optional(),
  status: Joi.string().valid('Ativo', 'Inativo').optional(),
});

export default { criarUsuarioSchema, atualizarUsuarioSchema };