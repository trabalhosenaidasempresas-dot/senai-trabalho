import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const apiProxyTarget = process.env.API_PROXY_TARGET || 'http://backend:3000';

app.use((req, res, next) => {
  console.log('FRONTEND REQ', req.method, req.originalUrl, req.path);
  next();
});

app.get('/api/ping', (req, res) => {
  return res.json({ success: true, message: 'frontend ping' });
});

app.use('/api', createProxyMiddleware({
  target: apiProxyTarget,
  changeOrigin: true,
  secure: false,
  logLevel: 'debug',
  pathRewrite: (path, req) => {
    const rewrittenPath = path.startsWith('/api') ? path : `/api${path}`;
    console.log('proxy pathRewrite:', path, '=>', rewrittenPath);
    return rewrittenPath;
  },
  onProxyReq: (proxyReq, req) => {
    console.log('Proxying request to backend:', req.method, req.originalUrl, req.url, '=>', proxyReq.path);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Proxy response from backend:', req.method, req.originalUrl, 'status', proxyRes.statusCode);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message, req.method, req.url);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
    }
    res.end(JSON.stringify({ success: false, message: 'Proxy error' }));
  },
}));

app.use('/uploads', (req, res, next) => {
  console.log('UPLOAD PROXY MIDDLEWARE', req.method, req.originalUrl, req.path);
  next();
}, createProxyMiddleware({
  target: apiProxyTarget,
  changeOrigin: true,
  secure: false,
  logLevel: 'debug',
  pathRewrite: {
    '^/uploads': '/uploads',
  },
  onProxyReq: (proxyReq, req) => {
    console.log('Proxying upload request to backend:', req.method, req.originalUrl, req.url, '=>', proxyReq.path);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Upload proxy response from backend:', req.method, req.originalUrl, 'status', proxyRes.statusCode);
  },
  onError: (err, req, res) => {
    console.error('Upload proxy error:', err.message, req.method, req.url);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
    }
    res.end(JSON.stringify({ success: false, message: 'Upload proxy error' }));
  },
}));

app.use(express.static(path.join(__dirname, 'dist')));

app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`Frontend server running on http://localhost:${port}`);
});
