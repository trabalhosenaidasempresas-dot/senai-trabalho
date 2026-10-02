import { login } from '../src/services/authService.js';

(async () => {
  try {
    const result = await login({ email: 'admin@secult.com', senha: 'admin123' });
    console.log('LOGIN_RESULT', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('LOGIN_ERROR', err);
    if (err && err.stack) console.error(err.stack);
    if (err.details) console.error('DETAILS', err.details);
    process.exit(1);
  }
})();
