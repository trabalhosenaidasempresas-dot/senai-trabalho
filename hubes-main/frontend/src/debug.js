// Detectar erros durante o carregamento
window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Rejection:', event.reason);
});

console.log('=== ENVIRONMENT ===');
console.log('API_URL:', import.meta.env.VITE_API_URL);
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('===================');
