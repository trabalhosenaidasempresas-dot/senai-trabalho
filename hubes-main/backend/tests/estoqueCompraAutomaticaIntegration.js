#!/usr/bin/env node
/**
 * Integração Estoque -> Compras automáticas de reposição
 * Execução: node tests/estoqueCompraAutomaticaIntegration.js
 */

const API_BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@secult.com';
const ADMIN_SENHA = process.env.ADMIN_SENHA || 'admin123';

const fetch = global.fetch || require('node-fetch');

const request = async (method, endpoint, body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
};

const log = {
  section: (msg) => console.log(`\n=== ${msg} ===`),
  success: (msg) => console.log(`✔ ${msg}`),
  error: (msg) => console.error(`✖ ${msg}`),
  info: (msg) => console.log(`• ${msg}`),
};

const assert = (condition, msg) => {
  if (!condition) throw new Error(msg);
};

const run = async () => {
  log.section('Login admin');
  const loginRes = await request('POST', '/auth/login', { email: ADMIN_EMAIL, senha: ADMIN_SENHA });
  assert(loginRes.ok, `Login falhou: ${loginRes.status} ${JSON.stringify(loginRes.data)}`);
  const token = loginRes.data?.data?.token;
  assert(token, 'Token não retornado pelo login');
  log.success('Login admin bem-sucedido');

  const timestamp = Date.now();
  const products = [
    {
      nome: `Produto Auto Low ${timestamp}`,
      codigo: `AUTO-LOW-${timestamp}`,
      categoria: 'Teste',
      unidade: 'Un',
      quantidade: 1,
      estoqueMinimo: 10,
      estoqueMaximo: 50,
      preco: 10.5,
      fornecedor: 'Fornecedor Teste',
    },
    {
      nome: `Produto Auto Reject ${timestamp}`,
      codigo: `AUTO-REJ-${timestamp}`,
      categoria: 'Teste',
      unidade: 'Un',
      quantidade: 2,
      estoqueMinimo: 10,
      estoqueMaximo: 50,
      preco: 11.5,
      fornecedor: 'Fornecedor Teste',
    },
  ];

  log.section('Criar primeiro produto com estoque baixo');
  const create1 = await request('POST', '/estoque', products[0], token);
  assert(create1.ok && create1.data?.data?.id, `Falha ao criar produto 1: ${create1.status} ${JSON.stringify(create1.data)}`);
  const produtoId1 = create1.data.data.id;
  log.success(`Produto 1 criado: ${produtoId1}`);

  const list1 = await request('GET', '/compras?status=Aguardando%20Compra', null, token);
  assert(list1.ok, `Falha ao listar compras pendentes após criação: ${list1.status} ${JSON.stringify(list1.data)}`);
  const compra1 = (list1.data.data || []).find((item) => item.observacao?.includes(`AUTO_ESTOQUE:${produtoId1}`));
  assert(compra1, 'Compra automática de estoque não criada para o produto 1');
  assert(compra1.status === 'Aguardando Compra', `Status inicial inesperado: ${compra1.status}`);
  log.success(`Compra automática 1 criada: ${compra1.id} (status=${compra1.status})`);

  log.section('Verificar duplicação de compra automática ao atualizar mesmo produto');
  const update1 = await request('PUT', `/estoque/${produtoId1}`, { quantidade: 0 }, token);
  assert(update1.ok, `Falha ao atualizar produto 1: ${update1.status} ${JSON.stringify(update1.data)}`);
  log.success('Produto 1 atualizado sem criar compra automática duplicada');

  const listAfterUpdate = await request('GET', '/compras?status=Aguardando%20Compra', null, token);
  const occurrences = (listAfterUpdate.data.data || []).filter((item) => item.observacao?.includes(`AUTO_ESTOQUE:${produtoId1}`));
  assert(occurrences.length === 1, `Compra automática duplicada encontrada para produto 1: ${occurrences.length}`);
  log.success('Nenhuma compra automática duplicada foi criada');

  log.section('Aprovar compra automática 1');
  const aprovar1 = await request('POST', `/compras/${compra1.id}/aprovacao`, { aprovado: true }, token);
  assert(aprovar1.ok, `Falha ao aprovar compra 1: ${aprovar1.status} ${JSON.stringify(aprovar1.data)}`);
  assert(aprovar1.data.data?.status === 'Compra', `Status após aprovação inesperado: ${aprovar1.data.data?.status}`);
  log.success('Compra automática 1 aprovada com sucesso');

  const get1 = await request('GET', `/compras/${compra1.id}`, null, token);
  assert(get1.ok, `Falha ao buscar compra 1: ${get1.status} ${JSON.stringify(get1.data)}`);
  assert(get1.data.data?.status === 'Compra', 'Status do objeto após aprovação não é Compra');
  assert(get1.data.data?.dataAprovacao, 'dataAprovacao não definida após aprovação');
  log.success('Validação da compra aprovada concluída');

  log.section('Criar segundo produto com estoque baixo para rejeição');
  const create2 = await request('POST', '/estoque', products[1], token);
  assert(create2.ok && create2.data?.data?.id, `Falha ao criar produto 2: ${create2.status} ${JSON.stringify(create2.data)}`);
  const produtoId2 = create2.data.data.id;
  log.success(`Produto 2 criado: ${produtoId2}`);

  const list2 = await request('GET', '/compras?status=Aguardando%20Compra', null, token);
  const compra2 = (list2.data.data || []).find((item) => item.observacao?.includes(`AUTO_ESTOQUE:${produtoId2}`));
  assert(compra2, 'Compra automática de estoque não criada para o produto 2');
  log.success(`Compra automática 2 criada: ${compra2.id}`);

  log.section('Rejeitar compra automática 2');
  const rejeitar2 = await request('POST', `/compras/${compra2.id}/aprovacao`, { aprovado: false, motivoRejeicao: 'Teste rejeição automático' }, token);
  assert(rejeitar2.ok, `Falha ao rejeitar compra 2: ${rejeitar2.status} ${JSON.stringify(rejeitar2.data)}`);
  assert(rejeitar2.data.data?.status === 'Cancelada', `Status após rejeição inesperado: ${rejeitar2.data.data?.status}`);
  log.success('Compra automática 2 rejeitada com sucesso');

  const get2 = await request('GET', `/compras/${compra2.id}`, null, token);
  assert(get2.ok, `Falha ao buscar compra 2: ${get2.status} ${JSON.stringify(get2.data)}`);
  assert(get2.data.data?.status === 'Cancelada', 'Status do objeto após rejeição não é Cancelada');
  assert(get2.data.data?.motivoRejeicao === 'Teste rejeição automático', 'Motivo de rejeição não persistiu corretamente');
  log.success('Validação da compra rejeitada concluída');

  log.section('Resumo');
  log.success('Todos os casos do fluxo Estoque -> Compras automáticas passaram');
  process.exit(0);
};

run().catch((err) => {
  console.error('Erro no teste de integração:', err.message || err);
  process.exit(1);
});
