import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizePermission } from '../middlewares/authorizationMiddleware.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();

router.get('/summary', authenticate, authorizePermission('dashboard:read'), dashboardController.summary);

export default router;
