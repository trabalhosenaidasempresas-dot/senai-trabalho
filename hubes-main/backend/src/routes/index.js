import { Router } from 'express';
import authRoutes from './authRoutes.js';
import usuariosRoutes from './usuariosRoutes.js';
import documentosRoutes from './documentosRoutes.js';
import comprasRoutes from './comprasRoutes.js';
import estoqueRoutes from './estoqueRoutes.js';
import agendaRoutes from './agendaRoutes.js';
import ocorrenciasRoutes from './ocorrenciasRoutes.js';
import comunicacaoRoutes from './comunicacaoRoutes.js';
import servicosRoutes from './servicosRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/documentos', documentosRoutes);
router.use('/compras', comprasRoutes);
router.use('/estoque', estoqueRoutes);
router.use('/agenda', agendaRoutes);
router.use('/ocorrencias', ocorrenciasRoutes);
router.use('/servicos', servicosRoutes);
router.use('/comunicacao', comunicacaoRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
