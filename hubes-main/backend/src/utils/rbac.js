export const ROLES = ['Administrador', 'Gestor', 'Servidor', 'Visitante'];

const normalizePermission = (permission) => permission.toLowerCase();

const permissionMatches = (grant, required) => {
  const grantParts = normalizePermission(grant).split(':');
  const requiredParts = normalizePermission(required).split(':');

  if (grantParts[0] !== requiredParts[0] && grantParts[0] !== '*') return false;
  if (grantParts[0] === '*') return true;
  if (grantParts[1] === '*' || grantParts[1] === requiredParts[1]) return true;
  return false;
};

export const ROLE_PERMISSIONS = {
  Administrador: ['*'],
  Gestor: [
    'usuarios:read',
    'usuarios:update',
    'documentos:*',
    'compras:*',
    'estoque:read',
    'agenda:*',
    'ocorrencias:*',
    'servicos:*',
    'comunicacao:*',
  ],
  Servidor: [
    'usuarios:read',
    'usuarios:update',
    'documentos:read',
    'compras:read',
    'estoque:read',
    'agenda:read',
    'ocorrencias:create',
    'ocorrencias:read',
    'servicos:create',
    'servicos:read',
    'servicos:update',
    'comunicacao:read',
  ],
  Visitante: [
    'documentos:read',
    'compras:read',
    'estoque:read',
    'agenda:read',
    'ocorrencias:read',
    'servicos:read',
    'comunicacao:read',
  ],
};

export const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  const grants = ROLE_PERMISSIONS[role] || [];
  return grants.some((grant) => permissionMatches(grant, permission));
};

export const isRoleAuthorized = (role, allowedRoles) => {
  if (!role || !allowedRoles?.length) return false;
  return allowedRoles.includes(role);
};

export const getDefaultPermissions = (role) => ROLE_PERMISSIONS[role] || [];
