import { ApiError } from '../utils/errors.js';
import { hasPermission, isRoleAuthorized } from '../utils/rbac.js';

export const authorizeRoles = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Usuário não autenticado');
  }

  if (!isRoleAuthorized(req.user.perfil, allowedRoles)) {
    throw ApiError.forbidden('Acesso negado. Permissão insuficiente.');
  }

  next();
};

export const authorizePermission = (permission) => (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Usuário não autenticado');
  }

  if (!hasPermission(req.user.perfil, permission)) {
    throw ApiError.forbidden('Acesso negado. Permissão insuficiente.');
  }

  next();
};

export const authorizeSelfOrPermission = (permission) => (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Usuário não autenticado');
  }

  if (req.user.id === req.params.id) {
    return next();
  }

  if (!hasPermission(req.user.perfil, permission)) {
    throw ApiError.forbidden('Acesso negado. Permissão insuficiente.');
  }

  next();
};
