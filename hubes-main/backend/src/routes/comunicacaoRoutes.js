import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizePermission } from '../middlewares/authorizationMiddleware.js';
import * as comunicadoController from '../controllers/comunicadoController.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import { criarComunicadoSchema, atualizarComunicadoSchema } from '../validators/comunicadoValidator.js';

const router = Router();

router.get('/', authenticate, authorizePermission('comunicacao:read'), comunicadoController.listar);
router.post('/', authenticate, authorizePermission('comunicacao:create'), validationMiddleware(criarComunicadoSchema), comunicadoController.criar);
router.get('/:id', authenticate, authorizePermission('comunicacao:read'), comunicadoController.obter);
router.put('/:id', authenticate, authorizePermission('comunicacao:update'), validationMiddleware(atualizarComunicadoSchema), comunicadoController.atualizar);
router.delete('/:id', authenticate, authorizePermission('comunicacao:delete'), comunicadoController.deletar);

export default router;
