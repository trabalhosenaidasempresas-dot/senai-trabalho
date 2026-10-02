import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizePermission } from '../middlewares/authorizationMiddleware.js';
import * as ocorrenciaController from '../controllers/ocorrenciaController.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import { criarOcorrenciaSchema, atualizarOcorrenciaSchema } from '../validators/ocorrenciaValidator.js';

const router = Router();

router.get('/', authenticate, authorizePermission('ocorrencias:read'), ocorrenciaController.listar);
router.post(
  '/',
  authenticate,
  authorizePermission('ocorrencias:create'),
  ocorrenciaController.uploadArquivos,
  validationMiddleware(criarOcorrenciaSchema),
  ocorrenciaController.criar,
);
router.get('/:id', authenticate, authorizePermission('ocorrencias:read'), ocorrenciaController.obter);
router.put(
  '/:id',
  authenticate,
  authorizePermission('ocorrencias:update'),
  ocorrenciaController.uploadArquivos,
  validationMiddleware(atualizarOcorrenciaSchema),
  ocorrenciaController.atualizar,
);
router.delete('/:id', authenticate, authorizePermission('ocorrencias:delete'), ocorrenciaController.deletar);
router.post('/:id/comentarios', authenticate, authorizePermission('ocorrencias:update'), ocorrenciaController.adicionarComentario);
router.get('/:id/comentarios', authenticate, authorizePermission('ocorrencias:read'), ocorrenciaController.listarComentarios);
router.get('/:id/historico', authenticate, authorizePermission('ocorrencias:read'), ocorrenciaController.listarHistorico);

export default router;
