import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizePermission } from '../middlewares/authorizationMiddleware.js';
import * as eventoController from '../controllers/eventoController.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import { criarEventoSchema, atualizarEventoSchema } from '../validators/eventoValidator.js';

const router = Router();

router.get('/', authenticate, authorizePermission('agenda:read'), eventoController.listar);
router.get('/disponibilidade', authenticate, authorizePermission('agenda:read'), eventoController.disponibilidade);
router.post('/', authenticate, authorizePermission('agenda:create'), validationMiddleware(criarEventoSchema), eventoController.criar);
router.get('/:id', authenticate, authorizePermission('agenda:read'), eventoController.obter);
router.put('/:id', authenticate, authorizePermission('agenda:update'), validationMiddleware(atualizarEventoSchema), eventoController.atualizar);
router.delete('/:id', authenticate, authorizePermission('agenda:delete'), eventoController.deletar);

export default router;
