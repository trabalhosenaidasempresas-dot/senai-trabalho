import fetch from 'node-fetch';

const BASE = 'http://localhost:3000/api';
const response = await fetch(`${BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@secult.com', senha: 'admin123' }),
});
const text = await response.text();
console.log('STATUS', response.status);
console.log('BODY', text);
