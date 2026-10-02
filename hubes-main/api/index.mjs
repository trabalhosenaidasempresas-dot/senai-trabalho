import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Debug: Log das variáveis de ambiente
console.log('🔍 [DEBUG] Variáveis de Ambiente Carregadas:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Definida' : '❌ NÃO Definida');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Definida' : '❌ NÃO Definida');

import { APP_CONFIG } from '../backend/src/config/appConfig.js';
import { uploadDirectory } from '../backend/src/config/uploadConfig.js';
import apiRoutes from '../backend/src/routes/index.js';
import apiErrorHandler from '../backend/src/middlewares/apiErrorHandler.js';
import { httpLogger } from '../backend/src/middlewares/httpLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuração melhorada para Vercel
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Permitir Vercel URLs (produção e previews)
    if (origin.includes('vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Em desenvolvimento, permitir qualquer origem
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Em produção, rejeitar origens não autorizadas
    callback(new Error('CORS não permitido para: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming ${req.method} ${req.path}`, req.headers['content-type']);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(httpLogger);

// Static files (uploads)
app.use('/uploads', express.static(uploadDirectory));

// API routes - Vercel keeps the /api prefix in the path
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  console.log('Health check called');
  res.json({ success: true, message: 'SIGA Secult Backend está rodando!' });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Error handler
app.use(apiErrorHandler);

// Export para Vercel Serverless Functions
export default app;
