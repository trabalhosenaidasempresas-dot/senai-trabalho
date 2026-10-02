const base = 'http://localhost:3000/api';
const loginRes = await fetch(`${base}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@secult.com', senha: 'admin123' }),
});
const login = await loginRes.json();
console.log('login', JSON.stringify(login));
const token = login?.data?.token;
if (!token) process.exit(1);
const createRes = await fetch(`${base}/servicos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    tipoServico: 'Manutenção',
    nome: 'Teste Manutenção Tab',
    categoria: 'Manutencao',
    fornecedor: 'Fornecedor Tab',
    dataInicio: '2026-08-11',
    dataVencimento: '2026-09-11',
    periodicidade: 'Mensal',
    status: 'Vigente',
  }),
});
const create = await createRes.json();
console.log('create', JSON.stringify(create));
