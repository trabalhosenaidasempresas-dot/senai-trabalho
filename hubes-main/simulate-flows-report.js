/* Simulate form flows and produce a JSON report
   Usage: node simulate-flows-report.js
   Assumes API running at API_BASE env or default http://localhost:3000
*/
const fs = require('fs');
const path = require('path');

const BASE = (process.env.API_BASE || 'http://localhost:3000').replace(/\/$/, '') + '/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@secult.com';
const ADMIN_SENHA = process.env.ADMIN_SENHA || 'admin123';

const nowTs = new Date().toISOString().replace(/[:.]/g, '-');
const reportsDir = path.join(__dirname, 'backend', 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
const reportPath = path.join(reportsDir, `e2e-report-${nowTs}.json`);

const results = { runAt: new Date().toISOString(), base: BASE, steps: [] };

const log = (...args) => console.log(new Date().toISOString(), ...args);

async function request(pathSuffix, opts = {}, token) {
  const headers = opts.headers || {};
  headers['Accept'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (opts.body && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(BASE + pathSuffix, { ...opts, headers });
  const text = await response.text();
  let body = null;
  try { body = JSON.parse(text); } catch (e) { body = text; }
  return { status: response.status, ok: response.ok, body };
}

(async () => {
  try {
    log('Starting E2E simulation against', BASE);

    const step = async (name, fn) => {
      const started = new Date().toISOString();
      try {
        const res = await fn();
        const finished = new Date().toISOString();
        results.steps.push({ name, ok: !!res.ok, status: res.status, response: res.body, started, finished });
        log(name, '=>', res.status);
        return res;
      } catch (err) {
        const finished = new Date().toISOString();
        results.steps.push({ name, ok: false, error: err.message || String(err), started, finished });
        log(name, 'ERROR', err.message || err);
        throw err;
      }
    };

    // Login
    const loginRes = await step('login', () => request('/auth/login', { method: 'POST', body: JSON.stringify({ email: ADMIN_EMAIL, senha: ADMIN_SENHA }) }));
    if (!loginRes.ok) throw new Error('Login failed');
    const token = loginRes.body?.data?.token;

    // Produto
    const produtoPayload = { nome: 'Produto Teste E2E', codigo: 'PROD-E2E-01', categoria: 'Teste', unidade: 'un', quantidade: 10, estoqueMinimo: 1, preco: 12.5, descricao: 'Criado por simulate-flows', ativo: true };
    const produtoRes = await step('create-produto', () => request('/estoque', { method: 'POST', body: JSON.stringify(produtoPayload) }, token));
    const listProdutos = await step('list-produtos', () => request('/estoque', { method: 'GET' }, token));

    // Compra
    const compraPayload = { fornecedor: 'Fornecedor E2E', fornecedorEmail: 'e2e@fornecedor.com', observacao: 'Compra E2E sem centro de custo', itens: [{ descricao: 'Item 1', quantidade: 2, valorUnitario: 100.0 }] };
    const compraRes = await step('create-compra', () => request('/compras', { method: 'POST', body: JSON.stringify(compraPayload) }, token));
    const listCompras = await step('list-compras', () => request('/compras', { method: 'GET' }, token));

    // Ocorrencia
    const ocorrenciaPayload = { titulo: 'Ocorrencia E2E', descricao: 'Descrição de teste', local: 'Local Teste', setor: 'Setor Teste', prioridade: 'Média' };
    const ocorrRes = await step('create-ocorrencia', () => request('/ocorrencias', { method: 'POST', body: JSON.stringify(ocorrenciaPayload) }, token));
    const listOcorr = await step('list-ocorrencias', () => request('/ocorrencias', { method: 'GET' }, token));

    // Comunicado
    const comunicadoPayload = { titulo: 'Comunicado E2E', conteudo: 'Conteúdo do comunicado de teste', tipo: 'Aviso' };
    const comRes = await step('create-comunicado', () => request('/comunicacao', { method: 'POST', body: JSON.stringify(comunicadoPayload) }, token));
    const listCom = await step('list-comunicacao', () => request('/comunicacao', { method: 'GET' }, token));

    // Evento
    const now = new Date();
    const later = new Date(now.getTime() + 3600*1000);
    const eventoPayload = { titulo: 'Evento E2E', descricao: 'Evento de teste', dataInicio: now.toISOString(), dataFim: later.toISOString(), tipo: 'Cultural' };
    const evRes = await step('create-evento', () => request('/agenda', { method: 'POST', body: JSON.stringify(eventoPayload) }, token));
    const listEventos = await step('list-eventos', () => request('/agenda', { method: 'GET' }, token));

    // Usuario
    const usuarioPayload = { nome: 'Usuario Teste E2E', email: `e2e.user.${Date.now()}@example.com`, senha: 'senha123', perfil: 'Visitante' };
    const userRes = await step('create-usuario', () => request('/usuarios', { method: 'POST', body: JSON.stringify(usuarioPayload) }, token));
    const listUsuarios = await step('list-usuarios', () => request('/usuarios', { method: 'GET' }, token));

    // Optional: simple DB persistence check via API lists already done above

    // Write report to file
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
    log('Report written to', reportPath);
    console.log('SUMMARY:', JSON.stringify({ report: reportPath, steps: results.steps.map(s => ({ name: s.name, ok: s.ok, status: s.status })) }, null, 2));
    process.exit(0);
  } catch (err) {
    // write partial report
    try { fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8'); log('Partial report written to', reportPath); } catch (e) {}
    console.error('Simulation failed:', err.message || err);
    process.exit(1);
  }
})();
