export const environment = {
  production: true,
  // O Render não injeta variáveis no Angular em tempo de build automaticamente sem plugins complexos.
  // Em um cenário real de infra, a URL do backend é injetada no CI/CD ou lida dinamicamente no window.
  // Como as APIs Rest precisam de URL, vamos preencher isso manual/dinamicamente.
  // Por ora, vamos suportar NG_APP_API_URL via process.env do Angular CLI, ou fallback
  apiUrl: process.env['NG_APP_API_URL'] || 'https://windops-api.onrender.com'
};
