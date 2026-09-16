declare const WINDOPS_API_URL: string;

const apiUrl =
  typeof WINDOPS_API_URL === 'string'
    ? WINDOPS_API_URL
    : 'https://windops-api.onrender.com';

export const environment = {
  production: true,
  apiUrl,
};
