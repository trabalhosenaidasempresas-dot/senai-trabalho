import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const registerSchema = Joi.object({
  nome: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required(),
  telefone: Joi.string().allow('', null),
  setor: Joi.string().allow('', null),
});

export const changePasswordSchema = Joi.object({
  senhaAtual: Joi.string().min(6).required(),
  novaSenha: Joi.string().min(6).required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  novaSenha: Joi.string().min(6).required(),
});
