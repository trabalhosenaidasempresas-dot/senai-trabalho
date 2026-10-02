import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import { ApiError } from '../utils/errors.js';
import * as usuarioService from './usuarioService.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  verifyRefreshToken,
  verifyPasswordResetToken,
  hashToken,
} from '../utils/jwt.js';

const buildUserPayload = (usuario) => ({
  id: usuario.id,
  email: usuario.email,
  perfil: usuario.perfil,
  nome: usuario.nome,
});

export const register = async ({ nome, email, senha, telefone, setor }) => {
  const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
  if (usuarioExistente) {
    throw ApiError.badRequest('Email já cadastrado');
  }

  const usuario = await usuarioService.criarUsuario({
    nome,
    email,
    senha,
    telefone,
    setor,
    perfil: 'Servidor',
    status: 'Ativo',
    criadoPor: null,
  });

  const payload = buildUserPayload(usuario);
  const token = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const hashedRefreshToken = hashToken(refreshToken);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { refreshToken: hashedRefreshToken },
  });

  return { usuario, token, refreshToken };
};

export const login = async ({ email, senha }) => {
  console.log(`🔐 [LOGIN] Tentativa de login com email: ${email}`);
  
  try {
    console.log(`🔐 [LOGIN] Buscando usuário no banco...`);
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    
    if (!usuario) {
      console.log(`🔐 [LOGIN] ❌ Usuário não encontrado: ${email}`);
      throw ApiError.unauthorized('Email ou senha inválidos');
    }
    
    console.log(`🔐 [LOGIN] ✅ Usuário encontrado: ${usuario.nome}`);

    if (usuario.status !== 'Ativo') {
      console.log(`🔐 [LOGIN] ❌ Usuário inativo: ${usuario.status}`);
      throw ApiError.forbidden('Usuário inativo');
    }

    console.log(`🔐 [LOGIN] Validando senha...`);
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      console.log(`🔐 [LOGIN] ❌ Senha inválida`);
      throw ApiError.unauthorized('Email ou senha inválidos');
    }
    
    console.log(`🔐 [LOGIN] ✅ Senha válida`);

    console.log(`🔐 [LOGIN] Gerando tokens...`);
    const payload = buildUserPayload(usuario);
    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const hashedRefreshToken = hashToken(refreshToken);

    console.log(`🔐 [LOGIN] Salvando refresh token no banco...`);
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { refreshToken: hashedRefreshToken },
    });

    console.log(`🔐 [LOGIN] ✅ Login bem-sucedido para: ${usuario.nome}`);
    
    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        setor: usuario.setor,
        status: usuario.status,
      },
      token,
      refreshToken,
    };
  } catch (error) {
    console.error(`🔐 [LOGIN] ❌ Erro durante login:`, error.message || error);
    throw error;
  }
};

export const refreshToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw ApiError.unauthorized('Refresh token inválido ou expirado');
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: decoded.id } });
  if (!usuario || usuario.status !== 'Ativo') {
    throw ApiError.unauthorized('Usuário inválido ou inativo');
  }

  const storedHash = usuario.refreshToken;
  if (!storedHash || storedHash !== hashToken(refreshToken)) {
    throw ApiError.unauthorized('Refresh token inválido ou expirado');
  }

  const payload = buildUserPayload(usuario);
  const newToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);
  const hashedNewRefreshToken = hashToken(newRefreshToken);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { refreshToken: hashedNewRefreshToken },
  });

  return { token: newToken, refreshToken: newRefreshToken };
};

export const logout = async (usuarioId) => {
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { refreshToken: null },
  });
  return true;
};

export const changePassword = async (usuarioId, senhaAtual, novaSenha) => {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    throw ApiError.notFound('Usuário não encontrado');
  }

  const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
  if (!senhaValida) {
    throw ApiError.unauthorized('Senha atual incorreta');
  }

  const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { senha: senhaCriptografada },
  });
  return true;
};

export const forgotPassword = async (email) => {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    throw ApiError.notFound('Usuário não encontrado');
  }

  const resetToken = generatePasswordResetToken({ id: usuario.id });
  const hashedResetToken = hashToken(resetToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * Number(process.env.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES || 60));

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      passwordResetToken: hashedResetToken,
      passwordResetExpires: expiresAt,
    },
  });

  return { resetToken };
};

export const resetPassword = async (token, novaSenha) => {
  const decoded = verifyPasswordResetToken(token);
  if (!decoded) {
    throw ApiError.unauthorized('Token de recuperação inválido ou expirado');
  }

  const hashedToken = hashToken(token);
  const usuario = await prisma.usuario.findFirst({
    where: {
      id: decoded.id,
      passwordResetToken: hashedToken,
      passwordResetExpires: { gte: new Date() },
    },
  });

  if (!usuario) {
    throw ApiError.unauthorized('Token de recuperação inválido ou expirado');
  }

  const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      senha: senhaCriptografada,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
  return true;
};

export default {
  login,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};
