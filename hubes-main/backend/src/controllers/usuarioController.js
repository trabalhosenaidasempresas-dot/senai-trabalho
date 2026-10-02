import * as usuarioService from '../services/usuarioService.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadDirectory } from '../config/uploadConfig.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { listResponse, successResponse } from '../utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

export const criar = asyncHandler(async (req, res) => {
  const { nome, email, senha, telefone, setor, perfil, status } = req.body;
  const usuario = await usuarioService.criarUsuario({
    nome,
    email,
    senha,
    telefone,
    setor,
    perfil,
    status,
    criadoPor: req.user?.id || null,
  });

  return successResponse(res, usuario, 'Usuário criado com sucesso', 201);
});

export const obter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.perfil !== 'Administrador' && req.user.id !== id) {
    return res.status(403).json({ success: false, message: 'Acesso negado' });
  }

  const usuario = await usuarioService.obterUsuario(id);
  return successResponse(res, usuario);
});

export const listar = asyncHandler(async (req, res) => {
  const {
    pagina = 1,
    limite = 10,
    search,
    perfil,
    status,
    sortField = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const resultado = await usuarioService.listarUsuarios(
    parseInt(pagina, 10),
    parseInt(limite, 10),
    search,
    perfil,
    status,
    sortField,
    sortOrder,
  );

  return listResponse(res, resultado.usuarios, resultado.paginacao);
});

export const atualizar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.perfil !== 'Administrador' && req.user.id !== id) {
    return res.status(403).json({ success: false, message: 'Acesso negado' });
  }

  const usuario = await usuarioService.atualizarUsuario(id, req.body, req.user.id);
  return successResponse(res, usuario, 'Usuário atualizado com sucesso');
});

export const deletar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await usuarioService.deletarUsuario(id, req.user.id);
  return successResponse(res, null, 'Usuário deletado com sucesso');
});

export const uploadFoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo foi enviado' });
  }

  const { id } = req.params;

  if (req.user.perfil !== 'Administrador' && req.user.id !== id) {
    return res.status(403).json({ success: false, message: 'Acesso negado' });
  }

  const usuario = await usuarioService.atualizarUsuario(id, {
    foto: `/uploads/${req.file.filename}`,
  }, req.user.id);

  return successResponse(res, usuario, 'Foto atualizada com sucesso');
});

export { upload };
