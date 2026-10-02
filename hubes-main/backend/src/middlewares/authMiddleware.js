import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/errors.js';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw ApiError.unauthorized('Token não fornecido');
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    throw ApiError.unauthorized('Token inválido ou expirado');
  }

  req.user = decoded;
  next();
};

export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Usuário não autenticado');
    }

    if (!allowedRoles.includes(req.user.perfil)) {
      throw ApiError.forbidden('Acesso negado. Permissão insuficiente.');
    }

    next();
  };
};
