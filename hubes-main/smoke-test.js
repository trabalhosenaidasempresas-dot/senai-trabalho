const fs = require('fs');
const { execSync } = require('child_process');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@secult.com';
const ADMIN_SENHA = process.env.ADMIN_SENHA || 'admin123';
const OUTPUT = process.env.SMOKE_OUTPUT || 'smoke-results.json';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function loginWithRetries() {
  for (let i = 1; i <= 30; i++) {
    try {
      const res = await fetch(BASE + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, senha: ADMIN_SENHA })
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = { raw: text }; }
      if (res.ok && json && json.data && json.data.token) {
        console.log('login success on attempt', i);
        return json.data.token;
      }
      console.log('login attempt', i, 'status', res.status);
    } catch (e) {
      console.log('login attempt error', i, e.message);
    }
    await delay(2000);
  }
  throw new Error('Login failed after retries');
}

async function run() {
  const results = [];
  try {
    const token = await loginWithRetries();
    results.push({ test: 'login', success: true });
    // Create a small temp file for upload
    const tmpFile = './smoke-temp-file.txt';
    fs.writeFileSync(tmpFile, 'smoke test file content');

    const tests = [
      { name: 'documento', useCurlUpload: true, url: '/api/documentos', body: { titulo: 'Doc smoke', tipo: 'Ofício', categoria: 'Teste', descricao: 'Criado pelo smoke test', data: '2026-08-01', numeroDocumento: 'DOC-SMOKE-001', nivelAcesso: 'Público', status: 'Ativo', assinado: 'true' }, file: tmpFile },
      { name: 'estoque', url: '/api/estoque', body: { nome: 'Produto smoke', codigo: 'PS-001', categoria: 'Teste', unidade: 'Un', quantidade: 3, estoqueMinimo: 1, estoqueMaximo: 10, localizacao: 'Depósito', descricao: 'Criado pelo smoke test', preco: 12.5, fornecedor: 'Fornecedor Smoke', ativo: true } },
      { name: 'agenda', url: '/api/agenda', body: { titulo: 'Reunião Smoke', descricao: 'Teste smoke', dataInicio: '2026-09-01', dataFim: '2026-09-02', local: 'Sala 3', tipo: 'Reunião', status: 'Ativo', participantes: 'admin@secult.com' } },
      { name: 'ocorrencia', url: '/api/ocorrencias', body: { titulo: 'Ocorrência Smoke', descricao: 'Teste smoke', local: 'Sede', setor: 'TI', prioridade: 'Média', status: 'Aberto', fotos: [], anexos: [], dataPrazo: '2026-08-15' } },
      { name: 'compra', url: '/api/compras', body: { fornecedor: 'Fornecedor Smoke', fornecedorEmail: 'teste@fornecedor.com', cnpj: '12345678000199', observacao: 'Compra smoke', dataEntrega: '2026-09-10T00:00:00.000Z', itens: [{ descricao: 'Item Smoke', quantidade: 1, valorUnitario: 200.0 }] } }
    ];

    for (const test of tests) {
      try {
        if (test.useCurlUpload) {
          // Use curl for multipart upload to avoid node form-data dependency
          const parts = [];
          for (const k of Object.keys(test.body)) {
            parts.push('-F');
            parts.push(`${k}=${test.body[k]}`);
          }
          parts.push('-F');
          parts.push(`arquivo=@${test.file}`);
          const cmd = ['curl', '-s', '-X', 'POST', `${BASE}${test.url}`, '-H', `Authorization: Bearer ${token}`, ...parts];
          // execSync expects a single string; join with spaces (file paths without spaces expected)
          const out = execSync(cmd.map(a => typeof a === 'string' ? a : a).join(' '), { encoding: 'utf8' });
          let data;
          try { data = JSON.parse(out); } catch { data = { raw: out }; }
          const success = data && (data.success === true || (data.id || data.data));
          results.push({ test: test.name, status: success ? 'created' : 'failed', http: null, response: data });
          console.log(test.name, success ? 'OK' : 'FAIL');
        } else {
          const res = await fetch(BASE + test.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify(test.body)
          });
          const text = await res.text();
          let data;
          try { data = JSON.parse(text); } catch { data = { raw: text }; }
          const success = res.status >= 200 && res.status < 300;
          results.push({ test: test.name, status: success ? 'created' : 'failed', http: res.status, response: data });
          console.log(test.name, 'status', res.status);
        }
      } catch (err) {
        console.error('test', test.name, 'error', err.message || err);
        results.push({ test: test.name, status: 'error', error: err.message || String(err) });
      }
    }

    // cleanup temp file
    try { fs.unlinkSync(tmpFile); } catch (e) {}

  } catch (err) {
    console.error('Fatal', err.message || err);
    fs.writeFileSync(OUTPUT, JSON.stringify({ fatal: err.message || String(err) }, null, 2));
    process.exit(2);
  }

  fs.writeFileSync(OUTPUT, JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2));
  const anyFailed = results.some(r => r.status === 'failed' || r.status === 'error');
  process.exit(anyFailed ? 1 : 0);
}

run();
