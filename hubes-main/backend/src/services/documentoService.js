import * as documentoRepository from '../repositories/documentoRepository.js';
import prisma from '../config/database.js';
import { ApiError } from '../utils/errors.js';

const parseDateField = (value) => {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseBooleanField = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

export const criarDocumento = async (dados) => {
  if (!dados.titulo || !dados.responsavelId || !dados.arquivo) {
    throw ApiError.badRequest('Título, responsável e arquivo são obrigatórios');
  }

  const documentDeviceTimestamp = parseDateField(dados.deviceTimestamp);
  const documentoData = {
    ...dados,
    data: dados.data ? parseDateField(dados.data) : new Date(),
    assinado: parseBooleanField(dados.assinado),
    deviceTimestamp: documentDeviceTimestamp || undefined,
  };
  delete documentoData.responsavelEmail;
  delete documentoData.userIp;

  const documento = await documentoRepository.criarDocumento(documentoData);
  await documentoRepository.adicionarHistorico(documento.id, 'Criado', `Documento ${documento.titulo} criado`, dados.responsavelEmail, dados.userIp);
  await documentoRepository.adicionarVersao(documento.id, 1, documento.arquivo, 'Versão inicial');
  return documento;
};

export const obterDocumento = async (id) => {
  const doc = await documentoRepository.buscarPorId(id);
  if (!doc) throw ApiError.notFound('Documento não encontrado');
  return doc;
};

export const listarDocumentos = async (
  pagina = 1,
  limite = 10,
  search = null,
  status = null,
  tipo = null,
  categoria = null,
  sortField = 'createdAt',
  sortOrder = 'desc',
  dateFrom = null,
  dateTo = null,
) => {
  const skip = (pagina - 1) * limite;
  const documentos = await documentoRepository.listar(skip, limite, search, status, tipo, categoria, sortField, sortOrder, dateFrom, dateTo);
  const total = await documentoRepository.contar(search, status, tipo, categoria, dateFrom, dateTo);

  return {
    documentos,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    },
  };
};

export const atualizarDocumento = async (id, dados, usuarioEmail = null, userIp = null) => {
  const doc = await documentoRepository.buscarPorId(id);
  if (!doc) throw ApiError.notFound('Documento não encontrado');

  const documentDeviceTimestamp = parseDateField(dados.deviceTimestamp);
  const documentoData = {
    ...dados,
    data: dados.data != null ? parseDateField(dados.data) : undefined,
    assinado: dados.assinado != null ? parseBooleanField(dados.assinado) : undefined,
    deviceTimestamp: documentDeviceTimestamp || undefined,
  };

  const atualizado = await documentoRepository.atualizar(id, documentoData);
  await documentoRepository.adicionarHistorico(id, 'Modificado', `Documento atualizado`, usuarioEmail, userIp);
  return atualizado;
};

export const deletarDocumento = async (id, usuarioEmail = null, userIp = null) => {
  const doc = await documentoRepository.buscarPorId(id);
  if (!doc) throw ApiError.notFound('Documento não encontrado');
  await documentoRepository.adicionarHistorico(id, 'Deletado', `Documento marcado como deletado`, usuarioEmail, userIp);
  await documentoRepository.deletar(id);
  return true;
};

export const adicionarVersao = async (documentoId, arquivo, usuarioEmail = null, userIp = null, tamanhoArquivo = null, mudancas = null) => {
  const versoes = await documentoRepository.listarVersoes(documentoId);
  const novaVersao = versoes && versoes.length ? Math.max(...versoes.map((v) => v.versao)) + 1 : 1;
  const criada = await documentoRepository.adicionarVersao(documentoId, novaVersao, arquivo, mudancas);
  await documentoRepository.adicionarHistorico(documentoId, 'Modificado', `Nova versão ${novaVersao}`, usuarioEmail, userIp);
  await documentoRepository.atualizar(documentoId, { arquivo, tamanhoArquivo });
  return criada;
};

export const listarVersoes = async (documentoId) => {
  return documentoRepository.listarVersoes(documentoId);
};

export const listarHistorico = async (documentoId) => {
  return documentoRepository.listarHistorico(documentoId);
};

export const obterArquivo = async (id) => {
  const doc = await documentoRepository.buscarPorId(id);
  if (!doc) throw ApiError.notFound('Documento não encontrado');
  return doc;
};

export default {
  criarDocumento,
  obterDocumento,
  listarDocumentos,
  atualizarDocumento,
  deletarDocumento,
  adicionarVersao,
  listarVersoes,
  listarHistorico,
  obterArquivo,
};
