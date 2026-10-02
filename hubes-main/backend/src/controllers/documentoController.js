import * as documentoService from '../services/documentoService.js';
import multer from 'multer';
import fs from 'fs';
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

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });
const uploadFields = upload.fields([{ name: 'arquivo', maxCount: 1 }, { name: 'fotos', maxCount: 10 }]);

export const criar = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.arquivo || !req.files.arquivo.length) throw ApiError.badRequest('Arquivo é obrigatório');

  const { titulo, descricao, assinado, deviceTimestamp, tipo, categoria, numeroDocumento, status, nivelAcesso, data, dataVencimento, fornecedor } = req.body;
  const arquivo = `/uploads/${req.files.arquivo[0].filename}`;
  const tamanhoArquivo = req.files.arquivo[0].size;

  const fotosArr = (req.files.fotos || []).map((f) => `/uploads/${f.filename}`);

  const documento = await documentoService.criarDocumento({
    titulo,
    descricao,
    tipo,
    categoria,
    numeroDocumento,
    status,
    nivelAcesso,
    responsavelId: req.user.id,
    responsavelEmail: req.user.email,
    userIp: req.ip,
    arquivo,
    tamanhoArquivo,
    assinado,
    deviceTimestamp,
    data: data || undefined,
    dataVencimento: dataVencimento || undefined,
    fornecedor: fornecedor || undefined,
    fotos: fotosArr.length ? fotosArr : undefined,
  });

  return successResponse(res, documento, 'Documento criado', 201);
});

const checkArquivoDisponivel = (arquivo) => {
  if (!arquivo) return false;
  const relativePath = arquivo.replace(/^\/+/, '').replace(/^uploads\//, '');
  const filePath = path.join(uploadDirectory, relativePath);
  return fs.existsSync(filePath);
};

export const listar = asyncHandler(async (req, res) => {
  const {
    pagina = 1,
    limite = 10,
    search,
    status,
    tipo,
    categoria,
    sortField = 'createdAt',
    sortOrder = 'desc',
    dateFrom = null,
    dateTo = null,
  } = req.query;

  const resultado = await documentoService.listarDocumentos(
    parseInt(pagina, 10),
    parseInt(limite, 10),
    search,
    status,
    tipo,
    categoria,
    sortField,
    sortOrder,
    dateFrom || null,
    dateTo || null,
  );
  

  const documentos = resultado.documentos.map((doc) => ({
    ...doc,
    arquivoDisponivel: checkArquivoDisponivel(doc.arquivo),
  }));

  return listResponse(res, documentos, resultado.paginacao);
});

export const obter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const documento = await documentoService.obterDocumento(id);
  return successResponse(res, { ...documento, arquivoDisponivel: checkArquivoDisponivel(documento.arquivo) });
});

export const atualizar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dados = { ...req.body };
  if (req.files && req.files.arquivo && req.files.arquivo.length) {
    dados.arquivo = `/uploads/${req.files.arquivo[0].filename}`;
    dados.tamanhoArquivo = req.files.arquivo[0].size;
  }
  if (req.files && req.files.fotos) {
    dados.fotos = req.files.fotos.map((f) => `/uploads/${f.filename}`);
  }
  if (req.body.deviceTimestamp) {
    dados.deviceTimestamp = req.body.deviceTimestamp;
  }
  const atualizado = await documentoService.atualizarDocumento(id, dados, req.user.email, req.ip);
  return successResponse(res, atualizado, 'Documento atualizado com sucesso');
});

export const deletar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await documentoService.deletarDocumento(id, req.user.email, req.ip);
  return successResponse(res, null, 'Documento deletado com sucesso');
});

export const uploadVersao = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!req.file) throw ApiError.badRequest('Arquivo é obrigatório');

  const arquivo = `/uploads/${req.file.filename}`;
  const tamanhoArquivo = req.file.size;
  const { mudancas } = req.body;

  const versao = await documentoService.adicionarVersao(id, arquivo, req.user.email, req.ip, tamanhoArquivo, mudancas);
  return successResponse(res, versao, 'Versão adicionada com sucesso');
});

export const listarVersoes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const versoes = await documentoService.listarVersoes(id);
  return successResponse(res, versoes);
});

export const listarHistorico = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const historico = await documentoService.listarHistorico(id);
  return successResponse(res, historico);
});

export const download = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const documento = await documentoService.obterArquivo(id);

  if (!documento || !documento.arquivo) {
    throw ApiError.notFound('Arquivo do documento não encontrado');
  }

  const relativePath = documento.arquivo.replace(/^\/+/, '').replace(/^uploads\//, '');
  const filePath = path.join(uploadDirectory, relativePath);

  if (!fs.existsSync(filePath)) {
    throw ApiError.notFound('Arquivo não encontrado no servidor');
  }

  const fileName = `${documento.titulo}${path.extname(documento.arquivo)}`;
  return res.download(filePath, fileName);
});

export { upload, uploadFields };
