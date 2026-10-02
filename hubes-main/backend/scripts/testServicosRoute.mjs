import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';
const CREDENTIALS = { email: 'admin@secult.com', senha: 'admin123' };

const run = async () => {
  const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS),
  });
  const loginJson = await loginResponse.json();
  console.log('LOGIN_STATUS', loginResponse.status);
  console.log('LOGIN_BODY', JSON.stringify(loginJson, null, 2));

  if (!loginJson.data?.token) {
    console.error('No token returned. Aborting.');
    process.exit(1);
  }

  const token = loginJson.data.token;
  const servicosResponse = await fetch(`${BASE_URL}/servicos?pagina=1&limite=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const servicosBody = await servicosResponse.text();
  console.log('SERVICOS_STATUS', servicosResponse.status);
  console.log('SERVICOS_BODY', servicosBody);
};

run().catch((err) => {
  console.error('ERROR', err);
  process.exit(1);
});
