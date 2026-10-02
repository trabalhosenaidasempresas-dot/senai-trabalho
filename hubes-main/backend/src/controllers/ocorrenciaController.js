import * as ocorrenciaService from '../services/ocorrenciaService.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadDirectory } from '../config/uploadConfig.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { listResponse, successResponse } from '../utils/response.js';
import { ApiError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirectory),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const normalizeArrayField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [value];
    }
  }
  return [];
};

export const uploadArquivos = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    return upload.fields([
      { name: 'fotos', maxCount: 10 },
      { name: 'anexos', maxCount: 10 },
    ])(req, res, next);
  }
  return next();
};

export const listar = asyncHandler(async (req, res) => {
  const {
    pagina = 1,
    limite = 10,
    search,
    status,
    prioridade,
    setor,
    sortField = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const resultado = await ocorrenciaService.listarOcorrencias(
    parseInt(pagina, 10),
    parseInt(limite, 10),
    search,
    status,
    prioridade,
    setor,
    sortField,
    sortOrder,
  );

  return listResponse(res, resultado.ocorrencias, resultado.paginacao);
});

export const criar = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  const normalizeField = (field) => (field !== undefined ? normalizeArrayField(field) : undefined);

  const normalizedFotos = normalizeField(payload.fotos);
  const normalizedAnexos = normalizeField(payload.anexos);

  if (req.files?.fotos) {
    payload.fotos = [
      ...(Array.isArray(normalizedFotos) ? normalizedFotos : []),
      ...req.files.fotos.map((file) => `/uploads/${file.filename}`),
    ];
  } else if (normalizedFotos !== undefined) {
    payload.fotos = normalizedFotos;
  } else {
    delete payload.fotos;
  }

  if (req.files?.anexos) {
    payload.anexos = [
      ...(Array.isArray(normalizedAnexos) ? normalizedAnexos : []),
      ...req.files.anexos.map((file) => `/uploads/${file.filename}`),
    ];
  } else if (normalizedAnexos !== undefined) {
    payload.anexos = normalizedAnexos;
  } else {
    delete payload.anexos;
  }

  const ocorrencia = await ocorrenciaService.criarOcorrencia({
    ...payload,
    responsavelId: req.user.id,
    responsavelEmail: req.user.email,
    userIp: req.ip,
  });

  return successResponse(res, ocorrencia, 'Ocorrência criada com sucesso', 201);
});

export const atualizar = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  const normalizeField = (field) => (field !== undefined ? normalizeArrayField(field) : undefined);

  const normalizedFotos = normalizeField(payload.fotos);
  const normalizedAnexos = normalizeField(payload.anexos);

  if (req.files?.fotos) {
    payload.fotos = [
      ...(Array.isArray(normalizedFotos) ? normalizedFotos : []),
      ...req.files.fotos.map((file) => `/uploads/${file.filename}`),
    ];
  } else if (normalizedFotos !== undefined) {
    payload.fotos = normalizedFotos;
  } else {
    delete payload.fotos;
  }

  if (req.files?.anexos) {
    payload.anexos = [
      ...(Array.isArray(normalizedAnexos) ? normalizedAnexos : []),
      ...req.files.anexos.map((file) => `/uploads/${file.filename}`),
    ];
  } else if (normalizedAnexos !== undefined) {
    payload.anexos = normalizedAnexos;
  } else {
    delete payload.anexos;
  }

  const ocorrencia = await ocorrenciaService.atualizarOcorrencia(
    req.params.id,
    payload,
    req.user.id,
    req.user.email,
    req.ip,
  );

  return successResponse(res, ocorrencia, 'Ocorrência atualizada com sucesso');
});

export const obter = asyncHandler(async (req, res) => {
  const ocorrencia = await ocorrenciaService.obterOcorrencia(req.params.id);
  return successResponse(res, ocorrencia);
});

export const deletar = asyncHandler(async (req, res) => {
  await ocorrenciaService.deletarOcorrencia(req.params.id, req.user.id, req.user.email, req.ip);
  return successResponse(res, null, 'Ocorrência deletada com sucesso');
});

export const adicionarComentario = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { conteudo } = req.body;

  if (!conteudo) {
    throw ApiError.badRequest('Conteúdo do comentário é obrigatório');
  }

  const comentario = await ocorrenciaService.adicionarComentario(id, {
    usuarioId: req.user.id,
    usuarioEmail: req.user.email,
    conteudo,
    userIp: req.ip,
  });

  return successResponse(res, comentario, 'Comentário adicionado com sucesso', 201);
});

export const listarComentarios = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const comentarios = await ocorrenciaService.listarComentarios(id);
  return successResponse(res, comentarios);
});

export const listarHistorico = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const historico = await ocorrenciaService.listarHistorico(id);
  return successResponse(res, historico);
});

