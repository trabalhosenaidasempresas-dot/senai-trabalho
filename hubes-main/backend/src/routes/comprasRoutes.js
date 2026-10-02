import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizePermission } from '../middlewares/authorizationMiddleware.js';
import * as compraController from '../controllers/compraController.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import {
  criarCompraSchema,
  atualizarCompraSchema,
  aprovarCompraSchema,
  documentoFiscalSchema,
  criarFornecedorSchema,
  atualizarFornecedorSchema,
} from '../validators/compraValidator.js';

const router = Router();

// ========================================
// COMPRAS
// ========================================
router.get('/', authenticate, authorizePermission('compras:read'), compraController.listar);
router.post('/', authenticate, authorizePermission('compras:create'), validationMiddleware(criarCompraSchema), compraController.criar);
router.get('/:id', authenticate, authorizePermission('compras:read'), compraController.obter);
router.put('/:id', authenticate, authorizePermission('compras:update'), validationMiddleware(atualizarCompraSchema), compraController.atualizar);
router.delete('/:id', authenticate, authorizePermission('compras:delete'), compraController.deletar);

// Aprovação Simples
router.post('/:id/aprovacao', authenticate, authorizePermission('compras:update'), validationMiddleware(aprovarCompraSchema), compraController.aprovar);

// Fluxo de Aprovação Detalhado
router.get('/:id/fluxo-aprovacao', authenticate, authorizePermission('compras:read'), compraController.obterFluxoAprovacao);
router.post('/:id/fluxo-aprovacao/aprovar', authenticate, authorizePermission('compras:update'), compraController.aprovarNoFluxo);
router.post('/:id/fluxo-aprovacao/rejeitar', authenticate, authorizePermission('compras:update'), compraController.rejeitarNoFluxo);

// Histórico
router.get('/:id/historico', authenticate, authorizePermission('compras:read'), compraController.listarHistorico);

// ========================================
// DOCUMENTOS FISCAIS
// ========================================
router.post('/:id/documentos-fiscais', authenticate, authorizePermission('compras:update'), compraController.uploadFiscalDocumento, validationMiddleware(documentoFiscalSchema), compraController.adicionarDocumentoFiscal);
router.get('/:id/documentos-fiscais', authenticate, authorizePermission('compras:read'), compraController.listarDocumentosFiscais);
router.get('/:id/documentos-fiscais/:documentoId/download', authenticate, authorizePermission('compras:read'), compraController.downloadDocumentoFiscal);
router.delete('/:id/documentos-fiscais/:documentoId', authenticate, authorizePermission('compras:delete'), compraController.deletarDocumentoFiscal);

// ========================================
// FORNECEDORES
// ========================================
router.get('/fornecedores/listar', authenticate, authorizePermission('compras:read'), compraController.listarFornecedores);
router.post('/fornecedores', authenticate, authorizePermission('compras:create'), validationMiddleware(criarFornecedorSchema), compraController.criarFornecedor);
router.get('/fornecedores/:id', authenticate, authorizePermission('compras:read'), compraController.obterFornecedor);
router.put('/fornecedores/:id', authenticate, authorizePermission('compras:update'), validationMiddleware(atualizarFornecedorSchema), compraController.atualizarFornecedor);
router.delete('/fornecedores/:id', authenticate, authorizePermission('compras:delete'), compraController.deletarFornecedor);

// ========================================
// CENTROS DE CUSTO
// ========================================
router.get('/centros-custo/listar', authenticate, authorizePermission('compras:read'), compraController.listarCentrosCusto);
router.get('/centros-custo/:id', authenticate, authorizePermission('compras:read'), compraController.obterCentroCusto);

// ========================================
// ESTATÍSTICAS E RELATÓRIOS
// ========================================
router.get('/estatisticas/geral', authenticate, authorizePermission('compras:read'), compraController.obterEstatisticas);
router.get('/estatisticas/por-status', authenticate, authorizePermission('compras:read'), compraController.obterEstatisticasPorStatus);
router.get('/estatisticas/por-centro-custo', authenticate, authorizePermission('compras:read'), compraController.obterEstatisticasPorCentroCusto);
router.get('/relatorios/compras', authenticate, authorizePermission('compras:read'), compraController.gerarRelatorio);

export default router;
