import { defineStore } from 'pinia';
import { authService } from '../services/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user
  },

  actions: {
    async register(userData) {
      try {
        this.loading = true;
        this.error = null;
        this.user = await authService.register(userData);
        return this.user;
      } catch (error) {
        this.error = error.response?.data?.error?.message || 
                    error.message || 
                    'Error en el registro. Por favor, intenta de nuevo.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async login(credentials) {
      try {
        this.loading = true;
        this.error = null;
        this.user = await authService.login(credentials);
        return this.user;
      } catch (error) {
        this.error = error.response?.data?.error?.message || 
                    error.message || 
                    'Error en el inicio de sesión. Por favor, verifica tus credenciales.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async checkAuth() {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          this.user = await authService.getCurrentUser();
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        this.logout();
      }
    },

    logout() {
      this.user = null;
      this.error = null;
      authService.logout();
    }
  }
}); 