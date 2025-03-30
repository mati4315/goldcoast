import api from '../config/strapi';

export const authService = {
  // Registrar un nuevo usuario
  async register(userData) {
    try {
      const response = await api.post('/auth/local/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password
      });
      
      // Almacenar el token JWT y los datos del usuario
      if (response.data.jwt) {
        localStorage.setItem('jwt', response.data.jwt);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error('No se recibió el token JWT');
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error.response?.data || error);
      throw error;
    }
  },
  
  // Iniciar sesión con credenciales
  async login(credentials) {
    try {
      const response = await api.post('/auth/local', {
        identifier: credentials.identifier,
        password: credentials.password
      });
      
      // Almacenar el token JWT y los datos del usuario
      if (response.data.jwt) {
        localStorage.setItem('jwt', response.data.jwt);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error('No se recibió el token JWT');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error.response?.data || error);
      throw error;
    }
  },
  
  // Obtener el usuario actual
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('jwt');
  },
  
  // Cerrar sesión
  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  },
  
  // Obtener datos del usuario actual desde el servidor
  async getCurrentUser() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
      throw error;
    }
  }
}; 