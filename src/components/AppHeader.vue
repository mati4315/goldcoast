<template>
  <header class="app-header" :class="{ 'header-hidden': isHeaderHidden }">
    <div class="header-content">
      <div class="logo">
        <img src="../assets/logo.png" alt="Logo">
      </div>
      
      <div class="configurations">
        <div class="language-selector">
          <select v-model="selectedLanguage" class="language-select" @change="saveConfigurations">
            <option value="es">Español</option>
            <option value="pt">Português</option>
          </select>
        </div>
        
        <div class="view-toggle-container">
          <label class="switch">
            <input 
              type="checkbox" 
              v-model="showTimestamps"
              @change="saveConfigurations"
            >
            <span class="slider round"></span>
          </label>
          <span class="toggle-label">{{ showTimestamps ? 'Mostrando timestamps' : 'Ocultando timestamps' }}</span>
        </div>

        <!-- Botón de inicio de sesión o menú de perfil -->
        <div class="auth-container">
          <button v-if="!isLoggedIn" class="login-button" @click="goToLogin">
            <svg xmlns="http://www.w3.org/2000/svg" height="20" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
            </svg>
            <span class="login-text">Iniciar Sesión</span>
          </button>

          <div v-else class="profile-menu">
            <button class="profile-button" @click="toggleProfileMenu">
              <svg xmlns="http://www.w3.org/2000/svg" height="20" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
              </svg>
            </button>
            
            <div v-if="showProfileMenu" class="profile-dropdown">
              <router-link to="/account" class="profile-option">
                <svg xmlns="http://www.w3.org/2000/svg" height="16" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
                </svg>
                Mi Perfil
              </router-link>
              <button class="profile-option" @click="handleLogout">
                <svg xmlns="http://www.w3.org/2000/svg" height="16" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                  <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isHeaderHidden = ref(false);
const lastScrollY = ref(0);
const selectedLanguage = ref('es');
const showTimestamps = ref(true);
const isLoggedIn = ref(false);
const showProfileMenu = ref(false);

// Emitir cambios cuando se modifiquen las configuraciones
const emit = defineEmits(['update:configurations']);

// Observar cambios en las configuraciones
watch([selectedLanguage, showTimestamps], ([newLanguage, newShowTimestamps]) => {
  emit('update:configurations', {
    language: newLanguage,
    showTimestamps: newShowTimestamps
  });
}, { immediate: true });

// Función para manejar el scroll
const handleScroll = () => {
  const currentScrollY = window.scrollY;
  
  // Mostrar header al hacer scroll hacia arriba
  if (currentScrollY < lastScrollY.value) {
    isHeaderHidden.value = false;
  } 
  // Ocultar header al hacer scroll hacia abajo
  else if (currentScrollY > lastScrollY.value && currentScrollY > 100) {
    isHeaderHidden.value = true;
  }
  
  lastScrollY.value = currentScrollY;
};

// Función para guardar configuraciones en localStorage
const saveConfigurations = () => {
  const configs = {
    language: selectedLanguage.value,
    showTimestamps: showTimestamps.value
  };
  localStorage.setItem('appConfigurations', JSON.stringify(configs));
  emit('update:configurations', configs);
};

// Función para cargar configuraciones desde localStorage
const loadConfigurations = () => {
  const savedConfigs = localStorage.getItem('appConfigurations');
  if (savedConfigs) {
    const configs = JSON.parse(savedConfigs);
    selectedLanguage.value = configs.language;
    showTimestamps.value = configs.showTimestamps;
  }
};

// Función para ir a la página de login
const goToLogin = () => {
  router.push('/login');
};

// Función para alternar el menú de perfil
const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
};

// Función para manejar el cierre de sesión
const handleLogout = () => {
  // Aquí implementarías la lógica de cierre de sesión
  isLoggedIn.value = false;
  showProfileMenu.value = false;
  router.push('/');
};

// Cerrar el menú al hacer clic fuera
const handleClickOutside = (event) => {
  if (showProfileMenu.value && !event.target.closest('.profile-menu')) {
    showProfileMenu.value = false;
  }
};

// Exponer las variables para que el padre pueda acceder a ellas
defineExpose({
  selectedLanguage,
  showTimestamps
});

onMounted(() => {
  loadConfigurations();
  window.addEventListener('scroll', handleScroll);
  document.addEventListener('click', handleClickOutside);
  // Aquí deberías verificar el estado de autenticación
  // Por ejemplo: isLoggedIn.value = checkAuthStatus();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #1a1a1a;
  z-index: 1000;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header-hidden {
  transform: translateY(-100%);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.logo img {
  height: 40px;
}

.configurations {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.language-selector {
  margin-right: 1rem;
}

.language-select {
  background-color: #333;
  color: #ccc;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
}

.language-select:hover {
  border-color: #666;
}

.language-select option {
  background-color: #333;
  color: #ccc;
}

.view-toggle-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-label {
  color: #ccc;
  font-size: 0.9rem;
}

/* Estilos para el switch */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #555;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.login-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid #555;
  color: #ccc;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 1rem;
}

.login-button:hover {
  background-color: #444;
  border-color: #666;
}

.login-text {
  font-size: 0.9rem;
}

.auth-container {
  position: relative;
  margin-left: 1rem;
}

.profile-button {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-button:hover {
  color: #fff;
}

.profile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  min-width: 150px;
  z-index: 1001;
  margin-top: 0.5rem;
}

.profile-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: #ccc;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.profile-option:hover {
  background-color: #333;
  color: #fff;
}

.profile-option svg {
  margin-right: 0.5rem;
}

/* Media queries para móvil */
@media (max-width: 768px) {
  .header-content {
    padding: 0.5rem 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .configurations {
    width: 100%;
    justify-content: space-between;
    padding: 0.5rem 0;
  }

  .language-select {
    padding: 4px 8px;
    font-size: 0.8rem;
  }

  .toggle-label {
    font-size: 0.8rem;
  }

  .switch {
    width: 50px;
    height: 28px;
  }

  .slider:before {
    height: 22px;
    width: 22px;
    left: 3px;
    bottom: 3px;
  }

  input:checked + .slider:before {
    transform: translateX(22px);
  }

  .login-button {
    padding: 4px 8px;
    margin-left: 0.5rem;
  }

  .login-text {
    font-size: 0.8rem;
  }

  .profile-dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin-top: 0;
    border-radius: 16px 16px 0 0;
    background-color: #1a1a1a;
    padding: 1rem;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }

  .profile-dropdown.show {
    transform: translateY(0);
  }

  .profile-option {
    padding: 1rem;
  }
}
</style> 