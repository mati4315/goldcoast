<template>
  <div class="register-form">
    <h2>Registro</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">Usuario</label>
        <input
          type="text"
          id="username"
          v-model="form.username"
          required
          class="form-control"
        />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          v-model="form.email"
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
        {{ loading ? 'Registrando...' : 'Registrarse' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <p class="login-link">
      ¿Ya tienes una cuenta? <router-link to="/login">Inicia sesión</router-link>
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
  username: '',
  email: '',
  password: ''
});

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    await authService.register(form.value);
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Error al registrarse. Por favor, intente de nuevo.';
    console.error('Error de registro:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-form {
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
  background-color: #4CAF50;
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

.login-link {
  margin-top: 15px;
  text-align: center;
}

.login-link a {
  color: #2196F3;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style> 