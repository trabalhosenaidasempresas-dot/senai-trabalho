import * as compraService from '../services/compraService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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

export const uploadFiscalDocumento = upload.single('arquivo');

export const listar = asyncHandler(async (req, res) => {
  const {
    pagina = 1,
    limite = 10,
    search,
    status,
    fornecedor,
    sortField = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const resultado = await compraService.listarCompras(
    parseInt(pagina, 10),
    parseInt(limite, 10),
    search,
    status,
    fornecedor,
    sortField,
    sortOrder,
  );

  return listResponse(res, resultado.compras, resultado.paginacao);
});

export const criar = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    solicitanteId: req.user.id,
    solicitanteEmail: req.user.email,
    userIp: req.ip,
  };

  const compra = await compraService.criarCompra(payload);
  return successResponse(res, compra, 'Compra criada com sucesso', 201);
});

export const obter = asyncHandler(async (req, res) => {
  const compra = await compraService.obterCompra(req.params.id);
  return successResponse(res, compra);
});

export const atualizar = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    userIp: req.ip,
  };

  const compra = await compraService.atualizarCompra(req.params.id, payload, req.user.id, req.user.email, req.ip);
  return successResponse(res, compra, 'Compra atualizada com sucesso');
});

export const deletar = asyncHandler(async (req, res) => {
  await compraService.deletarCompra(req.params.id, req.user.id, req.user.email, req.ip);
  return successResponse(res, null, 'Compra deletada com sucesso');
});

export const aprovar = asyncHandler(async (req, res) => {
  const compra = await compraService.aprovarCompra(req.params.id, req.body, req.user.id, req.user.email, req.ip);
  return successResponse(res, compra, 'Aprovação de compra registrada com sucesso');
});

export const adicionarDocumentoFiscal = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Arquivo fiscal é obrigatório');

  const documento = await compraService.adicionarDocumentoFiscal(req.params.id, {
    nomeArquivo: req.file.originalname,
    caminho: `/uploads/${req.file.filename}`,
    numeroNota: req.body.numeroNota || null,
    dataEmissao: req.body.dataEmissao || null,
    valor: req.body.valor ? Number(req.body.valor) : null,
    tipo: req.body.tipo || null,
    criadoPorId: req.user.id,
    criadoPor: req.user.email,
    userIp: req.ip,
  });

  return successResponse(res, documento, 'Documento fiscal anexado com sucesso', 201);
});

export const listarDocumentosFiscais = asyncHandler(async (req, res) => {
  const documentos = await compraService.listarDocumentosFiscais(req.params.id);
  return successResponse(res, documentos);
});

export const downloadDocumentoFiscal = asyncHandler(async (req, res) => {
  const documento = await compraService.obterDocumentoFiscal(req.params.documentoId);
  if (!documento || !documento.caminho) {
    throw ApiError.notFound('Documento fiscal não encontrado');
  }

  const relativePath = documento.caminho.replace(/^\//, '');
  const filePath = path.join(__dirname, '..', relativePath);
  const fileName = documento.nomeArquivo || path.basename(documento.caminho);
  return res.download(filePath, fileName);
});

export const listarHistorico = asyncHandler(async (req, res) => {
  const historico = await compraService.listarHistorico(req.params.id);
  return successResponse(res, historico);
});

// Documentos Fiscais - Deletar
export const deletarDocumentoFiscal = asyncHandler(async (req, res) => {
  await compraService.deletarDocumentoFiscal(req.params.documentoId, req.params.id, req.user.id, req.user.email, req.ip);
  return successResponse(res, null, 'Documento fiscal removido com sucesso');
});

// Fluxo de Aprovação
export const obterFluxoAprovacao = asyncHandler(async (req, res) => {
  const fluxo = await compraService.obterFluxoAprovacao(req.params.id);
  return successResponse(res, fluxo);
});

export const aprovarNoFluxo = asyncHandler(async (req, res) => {
  const aprovacao = await compraService.aprovarNoFluxo(
    req.params.id,
    req.body.nivel,
    req.body,
    req.user.id,
    req.user.email,
    req.ip
  );
  return successResponse(res, aprovacao, 'Aprovação registrada com sucesso');
});

export const rejeitarNoFluxo = asyncHandler(async (req, res) => {
  const aprovacao = await compraService.rejeitarNoFluxo(
    req.params.id,
    req.body.nivel,
    req.body,
    req.user.id,
    req.user.email,
    req.ip
  );
  return successResponse(res, aprovacao, 'Rejeição registrada com sucesso');
});

// Fornecedores
export const listarFornecedores = asyncHandler(async (req, res) => {
  const { pagina = 1, limite = 10, search, status = 'Ativo' } = req.query;
  const resultado = await compraService.listarFornecedores(parseInt(pagina, 10), parseInt(limite, 10), search, status);
  return listResponse(res, resultado.fornecedores, resultado.paginacao);
});

export const obterFornecedor = asyncHandler(async (req, res) => {
  const fornecedor = await compraService.obterFornecedor(req.params.id);
  return successResponse(res, fornecedor);
});

export const criarFornecedor = asyncHandler(async (req, res) => {
  const fornecedor = await compraService.criarFornecedor(req.body);
  return successResponse(res, fornecedor, 'Fornecedor criado com sucesso', 201);
});

export const atualizarFornecedor = asyncHandler(async (req, res) => {
  const fornecedor = await compraService.atualizarFornecedor(req.params.id, req.body);
  return successResponse(res, fornecedor, 'Fornecedor atualizado com sucesso');
});

export const deletarFornecedor = asyncHandler(async (req, res) => {
  await compraService.deletarFornecedor(req.params.id);
  return successResponse(res, null, 'Fornecedor removido com sucesso');
});

// Centros de Custo
export const listarCentrosCusto = asyncHandler(async (req, res) => {
  const { pagina = 1, limite = 10, search } = req.query;
  const resultado = await compraService.listarCentrosCusto(parseInt(pagina, 10), parseInt(limite, 10), search);
  return listResponse(res, resultado.centros, resultado.paginacao);
});

export const obterCentroCusto = asyncHandler(async (req, res) => {
  const centro = await compraService.obterCentroCusto(req.params.id);
  return successResponse(res, centro);
});

// Estatísticas e Relatórios
export const obterEstatisticas = asyncHandler(async (req, res) => {
  const stats = await compraService.obterEstatisticasCompras();
  return successResponse(res, stats);
});

export const obterEstatisticasPorStatus = asyncHandler(async (req, res) => {
  const stats = await compraService.obterEstatisticasPorStatus();
  return successResponse(res, stats);
});

export const obterEstatisticasPorCentroCusto = asyncHandler(async (req, res) => {
  const stats = await compraService.obterEstatisticasPorCentroCusto();
  return successResponse(res, stats);
});

export const gerarRelatorio = asyncHandler(async (req, res) => {
  const { dataInicio, dataFim, status, fornecedor, formato = 'json' } = req.query;
  
  const resultado = await compraService.gerarRelatorioCompras({
    dataInicio,
    dataFim,
    status,
    fornecedor,
    formatoData: formato,
  });

  if (formato === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio-compras.csv');
    return res.send(resultado);
  }

  return successResponse(res, resultado);
});
