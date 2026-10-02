import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { APP_CONFIG } from './config/appConfig.js';
import { uploadDirectory } from './config/uploadConfig.js';
import apiRoutes from './routes/index.js';
import apiErrorHandler from './middlewares/apiErrorHandler.js';
import { httpLogger } from './middlewares/httpLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

console.log('Setting up middleware...');
app.use(cors());
console.log('CORS configured');

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} ${req.path}`, req.headers['content-type']);
  next();
});

app.use(express.json());
console.log('Express.json() configured');

app.use(express.urlencoded({ limit: '50mb', extended: true }));
console.log('Express.urlencoded() configured');

app.use(httpLogger);

console.log('Serving uploads from', uploadDirectory);
app.use('/uploads', express.static(uploadDirectory));
app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SIGA Secult Backend está rodando!' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

app.use(apiErrorHandler);

const PORT = APP_CONFIG.port;

app.listen(PORT, () => {
  console.log(`✓ Servidor SIGA Secult rodando em http://localhost:${PORT}`);
});
