/**
 * SIGA Secult - API Integration Tests
 * Script para testar todas as endpoints da API
 * Execução: npm run test:api ou node ./tests/apiTests.js
 */

const API_BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@secult.com';
const ADMIN_SENHA = process.env.ADMIN_SENHA || 'admin123';

import fs from 'fs';
import { spawnSync } from 'child_process';

let authToken = null;
let adminToken = null;
let userId = null;
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)
};

// Função para fazer requisições
const request = async (method, endpoint, data = null, token = authToken) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {};
    let body;

    if (data instanceof FormData) {
      body = data;
    } else {
      headers['Content-Type'] = 'application/json';
      body = data ? JSON.stringify(data) : undefined;
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        data: responseData,
        message: response.statusText,
      };
    }

    return { success: true, data: responseData, status: response.status };
  } catch (error) {
    return {
      success: false,
      status: null,
      data: null,
      message: error.message,
    };
  }
};

// Função para testar
const requestMultipart = (endpoint, formFields, token) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const args = ['-s', '-X', 'POST', url];

  if (token) {
    args.push('-H', `Authorization: Bearer ${token}`);
  }

  for (const [key, value] of Object.entries(formFields)) {
    if (key === 'arquivoPath') continue;
    args.push('-F', `${key}=${value}`);
  }

  if (!formFields.arquivoPath) {
    throw new Error('arquivoPath is required for multipart upload');
  }

  args.push('-F', `arquivo=@${formFields.arquivoPath}`);
  const result = spawnSync('curl', args, { encoding: 'utf8' });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`curl failed: ${result.stderr || 'unknown error'}`);
  }

  const body = result.stdout || '{}';
  try {
    return JSON.parse(body);
  } catch (err) {
    return { raw: body };
  }
};

const test = async (name, fn) => {
  try {
    await fn();
    results.passed++;
    results.tests.push({ name, status: 'PASSED' });
    log.success(name);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAILED', error: error.message });
    log.error(`${name}: ${error.message}`);
  }
};

// ============================================
// TESTES
// ============================================

async function runTests() {
  log.section('🚀 SIGA SECULT - API INTEGRATION TESTS');

  // 1. TESTES DE AUTENTICAÇÃO
  log.section('1️⃣ AUTENTICAÇÃO (Auth)');

  let registeredUserId = null;
  let registeredEmail = `teste-registro-${Date.now()}@secult.com`;
  let registeredPassword = 'teste123';

  await test('POST /auth/register - Cadastro público', async () => {
    const result = await request('POST', '/auth/register', {
      nome: 'Registro Público',
      email: registeredEmail,
      senha: registeredPassword,
      telefone: '(27) 9999-9999',
      setor: 'TI',
    }, null);

    if (!result.success || result.status !== 201) {
      throw new Error(`Status ${result.status}: ${result.data?.message || result.message}`);
    }

    if (!result.data?.data?.token || !result.data.data?.usuario?.id) {
      throw new Error('Resposta de cadastro inválida');
    }

    registeredUserId = result.data.data.usuario.id;
    log.info(`  └─ Usuário registrado: ${registeredUserId}`);
  });

  await test('POST /auth/login - Login com usuário registrado', async () => {
    const result = await request('POST', '/auth/login', {
      email: registeredEmail,
      senha: registeredPassword,
    }, null);

    if (!result.success || result.status !== 200) {
      throw new Error(`Status ${result.status}: ${result.data?.message || result.message}`);
    }

    if (!result.data?.data?.token) {
      throw new Error('Token não retornado na resposta');
    }

    authToken = result.data.data.token;
    userId = result.data.data.usuario?.id;
    log.info(`  └─ User token obtido: ${authToken.substring(0, 20)}...`);
  });

  await test('POST /auth/login - Login como admin', async () => {
    const result = await request('POST', '/auth/login', {
      email: ADMIN_EMAIL,
      senha: ADMIN_SENHA,
    }, null);

    if (!result.success || result.status !== 200) {
      throw new Error(`Status ${result.status}: ${result.data?.message || result.message}`);
    }

    if (!result.data?.data?.token) {
      throw new Error('Token admin não retornado na resposta');
    }

    adminToken = result.data.data.token;
    log.info(`  └─ Admin token obtido: ${adminToken.substring(0, 20)}...`);
  });

  await test('GET /health - Health check', async () => {
    const result = await request('GET', '/health', null, null);
    if (!result.success || result.status !== 200) {
      throw new Error(`Status ${result.status}`);
    }
  });

  // 2. TESTES DE USUÁRIOS
  log.section('2️⃣ USUÁRIOS (CRUD)');

  let novoUsuarioId = null;

  await test('POST /usuarios - Criar novo usuário', async () => {
    const result = await request('POST', '/usuarios', {
      nome: 'Usuário Teste',
      email: `teste-${Date.now()}@secult.com`,
      senha: 'teste123',
      telefone: '(27) 9999-9999',
      setor: 'TI',
      perfil: 'Servidor'
    }, adminToken);

    if (!result.success || result.status !== 201) {
      throw new Error(`Status ${result.status}: ${result.data?.message || result.message}`);
    }

    novoUsuarioId = result.data.data?.id;
    log.info(`  └─ Usuário criado: ${novoUsuarioId}`);
  });

  await test('GET /usuarios - Listar usuários', async () => {
    const result = await request('GET', '/usuarios', null, adminToken);
    if (!result.success || result.status !== 200) {
      throw new Error(`Status ${result.status}`);
    }
    if (!Array.isArray(result.data.data)) {
      throw new Error('Resposta não contém array de usuários');
    }
    log.info(`  └─ Total de usuários: ${result.data.data.length}`);
  });

  await test('GET /usuarios/:id - Obter usuário por ID', async () => {
    if (!userId) throw new Error('userId não definido');
    const result = await request('GET', `/usuarios/${userId}`, null, adminToken);
    if (!result.success || result.status !== 200) {
      throw new Error(`Status ${result.status}`);
    }
  });

  await test('PUT /usuarios/:id - Atualizar usuário', async () => {
    if (!novoUsuarioId) throw new Error('novoUsuarioId não definido');
    const result = await request('PUT', `/usuarios/${novoUsuarioId}`, {
      nome: 'Usuário Teste Atualizado'
    }, adminToken);
    if (!result.success || result.status !== 200) {
      throw new Error(`Status ${result.status}: ${result.data?.message}`);
    }
  });

  await test('DELETE /usuarios/:id - Deletar usuário', async () => {
    if (!novoUsuarioId) throw new Error('novoUsuarioId não definido');
    const result = await request('DELETE', `/usuarios/${novoUsuarioId}`, null, adminToken);
    if (!result.success || (result.status !== 200 && result.status !== 204)) {
      throw new Error(`Status ${result.status}: ${result.data?.message}`);
    }
  });

  // 3. TESTES DE DOCUMENTOS
  log.section('3️⃣ DOCUMENTOS');

  let documentoId = null;

  await test('POST /documentos - Criar documento', async () => {
    const tmpFile = './tmp-api-document.txt';
    fs.writeFileSync(tmpFile, 'Documento de teste');

    const result = requestMultipart('/documentos', {
      titulo: 'Documento Teste',
      tipo: 'Ofício',
      categoria: 'Administrativo',
      descricao: 'Teste de criação de documento',
      data: new Date().toISOString(),
      arquivoPath: tmpFile,
    }, adminToken);

    fs.unlinkSync(tmpFile);

    if (!result || result.success === false) {
      throw new Error(`Falha no upload do documento: ${JSON.stringify(result)}`);
    }
    documentoId = result.data?.id || result.data?.data?.id;
    if (!documentoId) {
      throw new Error(`Resposta inválida ao criar documento: ${JSON.stringify(result)}`);
    }
  });

  await test('GET /documentos - Listar documentos', async () => {
    const result = await request('GET', '/documentos', null, adminToken);
    if (!result.success || result.status !== 200) {
      throw new Error(`Status ${result.status}`);
    }
  });

  if (documentoId) {
    await test('GET /documentos/:id - Obter documento', async () => {
      const result = await request('GET', `/documentos/${documentoId}`, null, adminToken);
      if (!result.success || result.status !== 200) {
        throw new Error(`Status ${result.status}`);
      }
    });

    await test('DELETE /documentos/:id - Deletar documento', async () => {
      const result = await request('DELETE', `/documentos/${documentoId}`, null, adminToken);
      if (!result.success) {
        throw new Error(`Status ${result.status}: ${result.data?.message}`);
      }
    });
  }

  // RESUMO
  log.section('📊 RESUMO DOS TESTES');
  log.success(`Testes aprovados: ${results.passed}`);
  log.error(`Testes falhados: ${results.failed}`);
  
  const total = results.passed + results.failed;
  const percentual = ((results.passed / total) * 100).toFixed(2);
  
  log.info(`\nTaxa de sucesso: ${percentual}% (${results.passed}/${total})`);

  process.exit(results.failed === 0 ? 0 : 1);
}

// Executar testes
runTests().catch(err => {
  log.error(`Erro ao executar testes: ${err.message}`);
  process.exit(1);
});
