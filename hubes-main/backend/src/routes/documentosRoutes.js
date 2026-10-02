import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizePermission } from '../middlewares/authorizationMiddleware.js';
import * as documentoController from '../controllers/documentoController.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import { criarDocumentoSchema, atualizarDocumentoSchema } from '../validators/documentoValidator.js';

const router = Router();

router.get('/', authenticate, authorizePermission('documentos:read'), documentoController.listar);
router.post('/', authenticate, authorizePermission('documentos:create'), documentoController.uploadFields, validationMiddleware(criarDocumentoSchema), documentoController.criar);
router.get('/:id', authenticate, authorizePermission('documentos:read'), documentoController.obter);
router.put('/:id', authenticate, authorizePermission('documentos:update'), documentoController.uploadFields, validationMiddleware(atualizarDocumentoSchema), documentoController.atualizar);
router.delete('/:id', authenticate, authorizePermission('documentos:delete'), documentoController.deletar);
router.post('/:id/versoes', authenticate, authorizePermission('documentos:update'), documentoController.upload.single('arquivo'), documentoController.uploadVersao);
router.get('/:id/versoes', authenticate, authorizePermission('documentos:read'), documentoController.listarVersoes);
router.get('/:id/historico', authenticate, authorizePermission('documentos:read'), documentoController.listarHistorico);
router.get('/:id/download', authenticate, authorizePermission('documentos:read'), documentoController.download);

export default router;
