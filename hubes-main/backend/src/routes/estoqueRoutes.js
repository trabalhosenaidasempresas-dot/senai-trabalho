import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizePermission } from '../middlewares/authorizationMiddleware.js';
import * as produtoController from '../controllers/produtoController.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import { criarProdutoSchema, atualizarProdutoSchema, criarMovimentacaoSchema } from '../validators/produtoValidator.js';

const router = Router();

router.get('/', authenticate, authorizePermission('estoque:read'), produtoController.listar);
router.post('/', authenticate, authorizePermission('estoque:create'), validationMiddleware(criarProdutoSchema), produtoController.criar);
router.get('/:id', authenticate, authorizePermission('estoque:read'), produtoController.obter);
router.put('/:id', authenticate, authorizePermission('estoque:update'), validationMiddleware(atualizarProdutoSchema), produtoController.atualizar);
router.delete('/:id', authenticate, authorizePermission('estoque:delete'), produtoController.deletar);
router.get('/:id/movimentacoes', authenticate, authorizePermission('estoque:read'), produtoController.listarMovimentacoes);
router.post('/:id/movimentacoes', authenticate, authorizePermission('estoque:update'), validationMiddleware(criarMovimentacaoSchema), produtoController.criarMovimentacao);

export default router;
