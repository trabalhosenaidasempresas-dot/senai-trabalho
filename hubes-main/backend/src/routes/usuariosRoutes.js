import { Router } from 'express';
import * as usuarioController from '../controllers/usuarioController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizePermission, authorizeRoles, authorizeSelfOrPermission } from '../middlewares/authorizationMiddleware.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import { criarUsuarioSchema, atualizarUsuarioSchema } from '../validators/usuarioValidator.js';

const router = Router();

router.post('/', authenticate, authorizePermission('usuarios:create'), validationMiddleware(criarUsuarioSchema), usuarioController.criar);
router.get('/', authenticate, authorizeRoles(['Administrador']), usuarioController.listar);
router.get('/:id', authenticate, authorizeSelfOrPermission('usuarios:read'), usuarioController.obter);
router.put('/:id', authenticate, authorizeSelfOrPermission('usuarios:update'), validationMiddleware(atualizarUsuarioSchema), usuarioController.atualizar);
router.delete('/:id', authenticate, authorizePermission('usuarios:delete'), usuarioController.deletar);
router.post('/:id/foto', authenticate, authorizeSelfOrPermission('usuarios:update'), usuarioController.upload.single('foto'), usuarioController.uploadFoto);

export default router;
