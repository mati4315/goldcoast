<template>
  <div class="login-form">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="identifier">Email o Usuario</label>
        <input
          type="text"
          id="identifier"
          v-model="form.identifier"
          required
          class="form-control"
        />
      </div>
      <div class="form-group">
        <label for="password">Contraseña</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          required
          class="form-control"
        />
      </div>
      <button type="submit" :disabled="loading" class="btn-submit">
        {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <p class="register-link">
      ¿No tienes una cuenta? <router-link to="/register">Regístrate</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth';

const router = useRouter();
const loading = ref(false);
const error = ref('');

const form = ref({
  identifier: '',
  password: ''
});

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    await authService.login(form.value);
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Error al iniciar sesión. Por favor, verifique sus credenciales.';
    console.error('Error de login:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-submit {
  width: 100%;
  padding: 10px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
}

.register-link {
  margin-top: 15px;
  text-align: center;
}

.register-link a {
  color: #4CAF50;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style> 