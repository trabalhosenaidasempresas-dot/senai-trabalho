/* Simulate form flows: login -> create resources -> verify by listing
   Usage: node simulate-flows.js
   Assumes API running at http://localhost:3000 and an admin account with
   email: admin@secult.com, senha: admin123
*/

const BASE = (process.env.API_BASE || 'http://localhost:3000').replace(/\/$/, '') + '/api';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@secult.com';
const ADMIN_SENHA = process.env.ADMIN_SENHA || 'admin123';

const log = (...args) => console.log(new Date().toISOString(), ...args);

async function request(path, opts = {}, token) {
  const headers = opts.headers || {};
  headers['Accept'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (opts.body && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(BASE + path, { ...opts, headers });
  const text = await response.text();
  let body = null;
  try { body = JSON.parse(text); } catch (e) { body = text; }
  return { status: response.status, ok: response.ok, body };
}

(async () => {
  try {
    log('Login with admin credentials', ADMIN_EMAIL);
    const loginRes = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: ADMIN_EMAIL, senha: ADMIN_SENHA }) });
    if (!loginRes.ok) {
      console.error('Login failed:', loginRes.status, loginRes.body);
      process.exit(2);
    }
    const token = loginRes.body?.data?.token;
    log('Token received:', !!token);

    // 1) Create Produto
    const produtoPayload = {
      nome: 'Produto Teste E2E',
      codigo: 'PROD-E2E-01',
      categoria: 'Teste',
      unidade: 'un',
      quantidade: 10,
      estoqueMinimo: 1,
      preco: 12.5,
      descricao: 'Criado por simulate-flows',
      ativo: true,
    };
    log('Criando produto...');
    const produtoRes = await request('/estoque', { method: 'POST', body: JSON.stringify(produtoPayload) }, token);
    log('Produto create status', produtoRes.status, JSON.stringify(produtoRes.body));

    // verify list
    const listaProdutos = await request('/estoque', { method: 'GET' }, token);
    log('Lista produtos status', listaProdutos.status);

    // 2) Create Compra
    const compraPayload = {
      fornecedor: 'Fornecedor E2E',
      fornecedorEmail: 'e2e@fornecedor.com',
      observacao: 'Compra E2E sem centro de custo',
      itens: [
        { descricao: 'Item 1', quantidade: 2, valorUnitario: 100.0 },
      ],
    };
    log('Criando compra...');
    const compraRes = await request('/compras', { method: 'POST', body: JSON.stringify(compraPayload) }, token);
    log('Compra create status', compraRes.status, JSON.stringify(compraRes.body));

    // verify list compras
    const listaCompras = await request('/compras', { method: 'GET' }, token);
    log('Lista compras status', listaCompras.status);

    // 3) Create Ocorrencia (no files)
    const ocorrenciaPayload = {
      titulo: 'Ocorrencia E2E',
      descricao: 'Descrição de teste',
      local: 'Local Teste',
      setor: 'Setor Teste',
      prioridade: 'Média'
    };
    log('Criando ocorrencia...');
    const ocorrRes = await request('/ocorrencias', { method: 'POST', body: JSON.stringify(ocorrenciaPayload) }, token);
    log('Ocorrencia create status', ocorrRes.status, JSON.stringify(ocorrRes.body));

    const listaOcorr = await request('/ocorrencias', { method: 'GET' }, token);
    log('Lista ocorrencias status', listaOcorr.status);

    // 4) Create Comunicado
    const comunicadoPayload = {
      titulo: 'Comunicado E2E',
      conteudo: 'Conteúdo do comunicado de teste',
      tipo: 'Aviso'
    };
    log('Criando comunicado...');
    const comRes = await request('/comunicacao', { method: 'POST', body: JSON.stringify(comunicadoPayload) }, token);
    log('Comunicado create status', comRes.status, JSON.stringify(comRes.body));

    const listaCom = await request('/comunicacao', { method: 'GET' }, token);
    log('Lista comunicacao status', listaCom.status);

    // 5) Create Evento
    const now = new Date();
    const later = new Date(now.getTime() + 3600*1000);
    const eventoPayload = {
      titulo: 'Evento E2E',
      descricao: 'Evento de teste',
      dataInicio: now.toISOString(),
      dataFim: later.toISOString(),
      tipo: 'Cultural'
    };
    log('Criando evento...');
    const evRes = await request('/agenda', { method: 'POST', body: JSON.stringify(eventoPayload) }, token);
    log('Evento create status', evRes.status, JSON.stringify(evRes.body));

    const listaEventos = await request('/agenda', { method: 'GET' }, token);
    log('Lista eventos status', listaEventos.status);

    // 6) Create Usuario
    const usuarioPayload = {
      nome: 'Usuario Teste E2E',
      email: `e2e.user.${Date.now()}@example.com`,
      senha: 'senha123',
      perfil: 'Visitante'
    };
    log('Criando usuario...');
    const userRes = await request('/usuarios', { method: 'POST', body: JSON.stringify(usuarioPayload) }, token);
    log('Usuario create status', userRes.status, JSON.stringify(userRes.body));

    const listaUsuarios = await request('/usuarios', { method: 'GET' }, token);
    log('Lista usuarios status', listaUsuarios.status);

    log('Simulação concluída. Se algum create retornou erro, verifique o payload e os logs do servidor.');
  } catch (err) {
    console.error('Erro na simulação:', err);
    process.exit(1);
  }
})();
