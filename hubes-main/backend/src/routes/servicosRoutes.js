import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizePermission } from '../middlewares/authorizationMiddleware.js';
import * as servicoController from '../controllers/servicoController.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import { criarServicoSchema, atualizarServicoSchema } from '../validators/servicoValidator.js';

const router = Router();

router.get('/', authenticate, authorizePermission('servicos:read'), servicoController.listar);
router.post(
  '/',
  authenticate,
  authorizePermission('servicos:create'),
  servicoController.uploadArquivos,
  validationMiddleware(criarServicoSchema),
  servicoController.criar,
);
router.get('/:id', authenticate, authorizePermission('servicos:read'), servicoController.obter);
router.put(
  '/:id',
  authenticate,
  authorizePermission('servicos:update'),
  servicoController.uploadArquivos,
  validationMiddleware(atualizarServicoSchema),
  servicoController.atualizar,
);
router.delete('/:id', authenticate, authorizePermission('servicos:delete'), servicoController.deletar);

export default router;
