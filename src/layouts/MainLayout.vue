<template>
  <div class="main-layout">
    <header class="app-header">
      <div class="logo">
        <h1>Mi Aplicación</h1>
      </div>
      <nav class="nav-menu">
        <template v-if="isAuthenticated">
          <router-link to="/dashboard">Dashboard</router-link>
          <a href="#" @click.prevent="handleLogout">Cerrar Sesión</a>
        </template>
        <template v-else>
          <router-link to="/login">Iniciar Sesión</router-link>
          <router-link to="/register">Registrarse</router-link>
        </template>
      </nav>
    </header>
    
    <main class="app-content">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth';

const router = useRouter();
const isAuthenticated = computed(() => authService.isAuthenticated());

const handleLogout = () => {
  authService.logout();
  router.push('/login');
};
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background-color: black;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  gap: 1.5rem;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.nav-menu a:hover {
  text-decoration: underline;
}

.app-content {
  flex: 1;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: black;
}
</style> 