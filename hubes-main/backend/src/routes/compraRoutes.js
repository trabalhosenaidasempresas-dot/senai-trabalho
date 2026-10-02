import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizePermission } from '../middlewares/authorizationMiddleware.js';
import * as compraController from '../controllers/compraController.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import { criarCompraSchema, atualizarCompraSchema } from '../validators/compraValidator.js';

const router = Router();

router.get('/', authenticate, authorizePermission('compras:read'), compraController.listar);
router.post('/', authenticate, authorizePermission('compras:create'), validationMiddleware(criarCompraSchema), compraController.criar);
router.get('/:id', authenticate, authorizePermission('compras:read'), compraController.obter);
router.put('/:id', authenticate, authorizePermission('compras:update'), validationMiddleware(atualizarCompraSchema), compraController.atualizar);
router.delete('/:id', authenticate, authorizePermission('compras:delete'), compraController.deletar);

export default router;
