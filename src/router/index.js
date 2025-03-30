import { createRouter, createWebHistory } from 'vue-router';
import { authService } from '../services/auth';

// Importar componentes
import HomePage from '../views/HomePage.vue';
import LoginForm from '../components/LoginForm.vue';
import RegisterForm from '../components/RegisterForm.vue';
import Dashboard from '../views/Dashboard.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { title: 'Inicio' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginForm,
    meta: { 
      requiresGuest: true,
      title: 'Iniciar Sesión'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterForm,
    meta: { 
      requiresGuest: true,
      title: 'Registro'
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { 
      requiresAuth: true,
      title: 'Dashboard'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Protección de rutas
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();
  
  // Actualizar el título de la página
  document.title = to.meta.title ? `${to.meta.title} | Mi Aplicación` : 'Mi Aplicación';
  
  // Ruta que requiere autenticación
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' });
  }
  
  // Ruta para invitados (no autenticados)
  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: 'dashboard' });
  }
  
  next();
});

export default router; 