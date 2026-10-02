import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as authService from '../services/authService.js';
import { successResponse } from '../utils/response.js';

export const login = asyncHandler(async (req, res) => {
  const { usuario, token, refreshToken } = await authService.login(req.body);
  return successResponse(res, { usuario, token, refreshToken }, 'Login realizado com sucesso', 200);
});

export const register = asyncHandler(async (req, res) => {
  const { usuario, token, refreshToken } = await authService.register(req.body);
  return successResponse(res, { usuario, token, refreshToken }, 'Cadastro realizado com sucesso', 201);
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { token, refreshToken } = await authService.refreshToken(req.body.refreshToken);
  return successResponse(res, { token, refreshToken }, 'Token renovado com sucesso');
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  return successResponse(res, null, 'Logout realizado com sucesso');
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.senhaAtual, req.body.novaSenha);
  return successResponse(res, null, 'Senha alterada com sucesso');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = await authService.forgotPassword(req.body.email);
  return successResponse(
    res,
    { resetToken },
    'Token de recuperação gerado. Em produção, este token deve ser enviado por email.',
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.novaSenha);
  return successResponse(res, null, 'Senha redefinida com sucesso');
});
