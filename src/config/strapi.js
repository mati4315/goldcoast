import axios from 'axios';

// Crear una instancia de axios con la URL base
const api = axios.create({
  baseURL: 'http://localhost:1337/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Agregar interceptor para incluir el token JWT en las solicitudes autenticadas
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la petición a Strapi:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api; 