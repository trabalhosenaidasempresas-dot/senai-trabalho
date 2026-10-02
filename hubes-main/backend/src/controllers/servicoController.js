import * as servicoService from '../services/servicoService.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadDirectory } from '../config/uploadConfig.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { successResponse, listResponse } from '../utils/response.js';
import { ApiError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirectory),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

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

const sanitizeEmptyValues = (obj) => {
  const dateKeys = ['proximaManutencao', 'ultimaManutencao', 'dataVencimento', 'dataInicio'];
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (trimmed === '' || trimmed === '""' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
        if (dateKeys.includes(k) || k.toLowerCase().endsWith('id')) obj[k] = null;
      }
    }
  });
};

export const listar = asyncHandler(async (req, res) => {
  const {
    pagina = 1,
    limite = 10,
    search,
    status,
    categoria,
    fornecedor,
    periodicidade,
    equipamento,
    tipoServico,
    situacao,
    periodoInicio,
    periodoFim,
    sortField = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const resultado = await servicoService.listarServicos(
    parseInt(pagina, 10),
    parseInt(limite, 10),
    search,
    status,
    categoria,
    fornecedor,
    periodicidade,
    equipamento,
    tipoServico,
    situacao,
    periodoInicio,
    periodoFim,
    sortField,
    sortOrder,
  );

  return listResponse(res, resultado.servicos, resultado.paginacao);
});

export const criar = asyncHandler(async (req, res) => {
  try {
    const payload = { ...req.body };

    const normalizedFotos = normalizeArrayField(payload.fotos);
    const normalizedAnexos = normalizeArrayField(payload.anexos);

    if (req.files?.fotos) {
      payload.fotos = [
        ...(Array.isArray(normalizedFotos) ? normalizedFotos : []),
        ...req.files.fotos.map((file) => `/uploads/${file.filename}`),
      ];
    } else if (normalizedFotos !== undefined) {
      payload.fotos = normalizedFotos;
    }

    if (req.files?.anexos) {
      payload.anexos = [
        ...(Array.isArray(normalizedAnexos) ? normalizedAnexos : []),
        ...req.files.anexos.map((file) => `/uploads/${file.filename}`),
      ];
    } else if (normalizedAnexos !== undefined) {
      payload.anexos = normalizedAnexos;
    }

    // Converter strings vazias para null em campos de data e chaves estrangeiras (ex: documentoId)
    sanitizeEmptyValues(payload);

    // Se documentoId for vazio ou não informativo, remover para evitar violação de FK
    if (payload.documentoId === '' || payload.documentoId === undefined || payload.documentoId === null) {
      delete payload.documentoId;
    }

    console.log('Creating servico with payload:', JSON.stringify({ ...payload, responsavelId: req.user?.id, responsavelEmail: req.user?.email }, null, 2));

    const servico = await servicoService.criarServico({
      ...payload,
      responsavelId: req.user.id,
      responsavelEmail: req.user.email,
      userIp: req.ip,
    });

    return successResponse(res, servico, 'Serviço criado com sucesso', 201);
  } catch (err) {
    console.error('Erro ao criar servico:', err && err.stack ? err.stack : err);
    throw err;
  }
});

export const obter = asyncHandler(async (req, res) => {
  const servico = await servicoService.obterServico(req.params.id);
  return successResponse(res, servico);
});

export const atualizar = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  const normalizedFotos = normalizeArrayField(payload.fotos);
  const normalizedAnexos = normalizeArrayField(payload.anexos);

  if (req.files?.fotos) {
    payload.fotos = [
      ...(Array.isArray(normalizedFotos) ? normalizedFotos : []),
      ...req.files.fotos.map((file) => `/uploads/${file.filename}`),
    ];
  } else if (normalizedFotos !== undefined) {
    payload.fotos = normalizedFotos;
  }

  if (req.files?.anexos) {
    payload.anexos = [
      ...(Array.isArray(normalizedAnexos) ? normalizedAnexos : []),
      ...req.files.anexos.map((file) => `/uploads/${file.filename}`),
    ];
  } else if (normalizedAnexos !== undefined) {
    payload.anexos = normalizedAnexos;
  }

  sanitizeEmptyValues(payload);

  if (payload.documentoId === '' || payload.documentoId === undefined || payload.documentoId === null) {
    delete payload.documentoId;
  }

  const servico = await servicoService.atualizarServico(
    req.params.id,
    payload,
    req.user.id,
    req.user.email,
    req.ip,
  );

  return successResponse(res, servico, 'Serviço atualizado com sucesso');
});

export const deletar = asyncHandler(async (req, res) => {
  await servicoService.deletarServico(req.params.id, req.user.id, req.user.email, req.ip);
  return successResponse(res, null, 'Serviço removido com sucesso');
});
