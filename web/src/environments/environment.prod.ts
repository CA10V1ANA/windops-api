export const environment = {
  production: true,
  // O Render não injeta variáveis no Angular em tempo de build automaticamente sem plugins complexos.
  // O Angular puro não suporta process.env no client side sem configurações extras.
  // Vamos deixar a URL de produção fixa aqui (Render).
  apiUrl: 'https://windops-api.onrender.com'
};
