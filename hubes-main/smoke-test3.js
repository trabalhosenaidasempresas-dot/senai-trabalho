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

async function uploadWithFetch(token, url, body, filePath) {
  // Try to use global FormData (Node 18+)
  const FormDataImpl = global.FormData || (typeof FormData !== 'undefined' && FormData);
  if (!FormDataImpl) throw new Error('No global FormData');
  const form = new FormDataImpl();
  for (const k of Object.keys(body)) form.append(k, body[k]);
  form.append('arquivo', fs.createReadStream(filePath));
  let headers = { Authorization: 'Bearer ' + token };
  if (typeof form.getHeaders === 'function') headers = Object.assign(headers, form.getHeaders());
  const res = await fetch(BASE + url, { method: 'POST', headers, body: form });
  const text = await res.text();
  try { return { status: res.status, body: JSON.parse(text) }; } catch { return { status: res.status, body: { raw: text } }; }
}

function curlUpload(token, url, body, filePath) {
  const parts = [];
  for (const k of Object.keys(body)) { parts.push('-F'); parts.push(`${k}=${body[k]}`); }
  parts.push('-F'); parts.push(`arquivo=@${filePath}`);
  const header = `Authorization: Bearer ${token}`;
  const cmd = ['curl', '-s', '-X', 'POST', `${BASE}${url}`, '-H', `"${header}"`, ...parts];
  const out = execSync(cmd.join(' '), { encoding: 'utf8' });
  try { return JSON.parse(out); } catch { return { raw: out }; }
}

async function run() {
  const results = [];
  try {
    const token = await loginWithRetries();
    results.push({ test: 'login', success: true });
    const tmpFile = './smoke-temp-file.txt';
    fs.writeFileSync(tmpFile, 'smoke test file content');

    const unique = Date.now();
    const tests = [
      { name: 'documento', upload: true, url: '/api/documentos', body: { titulo: `Doc smoke ${unique}`, tipo: 'Ofício', categoria: 'Teste', descricao: 'Criado pelo smoke test', data: new Date().toISOString(), numeroDocumento: `DOC-SMOKE-${unique}`, nivelAcesso: 'Público', status: 'Ativo', assinado: 'true' }, file: tmpFile },
      { name: 'estoque', url: '/api/estoque', body: { nome: `Produto smoke ${unique}`, codigo: `PS-${unique}`, categoria: 'Teste', unidade: 'Un', quantidade: 3, estoqueMinimo: 1, estoqueMaximo: 10, localizacao: 'Depósito', descricao: 'Criado pelo smoke test', preco: 12.5, fornecedor: 'Fornecedor Smoke', ativo: true } },
      { name: 'agenda', url: '/api/agenda', body: { titulo: `Reunião Smoke ${unique}`, descricao: 'Teste smoke', dataInicio: new Date().toISOString(), dataFim: new Date(Date.now() + 24*60*60*1000).toISOString(), local: 'Sala 3', tipo: 'Reunião', status: 'Ativo', participantes: 'admin@secult.com' } },
      { name: 'ocorrencia', url: '/api/ocorrencias', body: { titulo: `Ocorrência Smoke ${unique}`, descricao: 'Teste smoke', local: 'Sede', setor: 'TI', prioridade: 'Média', status: 'Aberto', fotos: [], anexos: [], dataPrazo: new Date(Date.now() + 7*24*60*60*1000).toISOString() } },
      { name: 'compra', url: '/api/compras', body: { fornecedor: 'Fornecedor Smoke', fornecedorEmail: 'teste@fornecedor.com', cnpj: `${String(unique).slice(0,14)}`, observacao: 'Compra smoke', dataEntrega: new Date(Date.now() + 9*24*60*60*1000).toISOString(), itens: [{ descricao: 'Item Smoke', quantidade: 1, valorUnitario: 200.0 }] } }
    ];

    for (const test of tests) {
      try {
        await delay(300); // slight pause between tests
        if (test.upload) {
          // Try fetch FormData first and fallback to curl if non-2xx
          let fetchRes = null;
          try {
            fetchRes = await uploadWithFetch(token, test.url, test.body, test.file);
          } catch (e) {
            console.log('fetch upload error, will try curl:', e.message || e);
          }
          if (fetchRes && fetchRes.status >= 200 && fetchRes.status < 300) {
            results.push({ test: test.name, status: 'created', http: fetchRes.status, response: fetchRes.body });
            console.log(test.name, 'status', fetchRes.status);
            continue;
          }
          // fallback to curl
          try {
            const data = curlUpload(token, test.url, test.body, test.file);
            const success = data && (data.success === true || (data.id || data.data));
            results.push({ test: test.name, status: success ? 'created' : 'failed', http: null, response: data });
            console.log(test.name, success ? 'OK (curl)' : 'FAIL (curl)');
            continue;
          } catch (err) {
            console.error('curl upload error', err.message || err);
            results.push({ test: test.name, status: 'error', error: err.message || String(err) });
            continue;
          }
        }

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
      } catch (err) {
        console.error('test', test.name, 'error', err.message || err);
        results.push({ test: test.name, status: 'error', error: err.message || String(err) });
      }
    }

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
