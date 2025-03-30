<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <div v-if="currentUser" class="user-info">
      <h2>Bienvenido, {{ currentUser.username }}</h2>
      <p>Email: {{ currentUser.email }}</p>
    </div>
    
    <div class="dashboard-content">
      <div class="dashboard-card">
        <h3>Estadísticas</h3>
        <p>Esta es tu área personal. Aquí verás todas tus estadísticas y datos.</p>
      </div>
      
      <div class="dashboard-card">
        <h3>Actividad Reciente</h3>
        <p>No hay actividad reciente para mostrar.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authService } from '../services/auth';

const currentUser = ref(null);

onMounted(async () => {
  try {
    // Obtener el usuario del almacenamiento local
    currentUser.value = authService.getUser();
    
    // Actualizar con datos del servidor
    const userData = await authService.getCurrentUser();
    currentUser.value = userData;
  } catch (error) {
    console.error('Error al cargar el usuario:', error);
  }
});
</script>

<style scoped>
.dashboard {
  max-width: 1000px;
  margin: 0 auto;
}

.user-info {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}
</style> 