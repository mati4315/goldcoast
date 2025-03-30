<template>
  <div class="home-page">
    <div class="hero-section">
      <!-- Contenido del hero si es necesario -->
    </div>
    
    <div class="news-container">
      <h2>Últimas Noticias</h2>
      
      <!-- Indicador de carga inicial -->
      <div v-if="loading && noticias.length === 0" class="loading">
        <div class="spinner"></div>
        <p>Cargando noticias...</p>
      </div>
      
      <!-- Lista de noticias -->
      <div class="news-list">
        <NewsCard
          v-for="noticia in noticias"
          :key="noticia.id"
          :noticia="noticia"
          :active-audio-id="activeAudioId"
          @audio-play="handleAudioPlay"
          @audio-pause="handleAudioPause"
          @audio-stop="handleAudioStop"
          ref="newsCardRefs"
        />
        
        <!-- Indicador de carga de más noticias -->
        <div v-if="loading && noticias.length > 0" class="loading-more">
          <div class="spinner-small"></div>
          <p>Cargando más noticias...</p>
        </div>
        
        <!-- Mensaje de fin -->
        <div v-if="noMorePosts && noticias.length > 0" class="end-message">
          No hay más noticias para mostrar
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '../config/strapi';
import NewsCard from '../components/NewsCard.vue';

// Estado
const noticias = ref([]);
const loading = ref(true);
const page = ref(1);
const pageSize = 5;
const noMorePosts = ref(false);
const activeAudioId = ref(null);
const newsCardRefs = ref([]);

// Obtener noticias
const fetchNoticias = async () => {
  if (loading.value && page.value > 1) return;
  
  try {
    loading.value = true;
    const response = await api.get(`/noticias`, {
      params: {
        sort: 'createdAt:desc',
        'pagination[page]': page.value,
        'pagination[pageSize]': pageSize
      }
    });
    
    const nuevosPosts = response.data.data;
    
    if (nuevosPosts.length === 0) {
      noMorePosts.value = true;
    } else {
      noticias.value = [...noticias.value, ...nuevosPosts];
      page.value++;
    }
  } catch (error) {
    console.error('Error al cargar las noticias:', error);
  } finally {
    loading.value = false;
  }
};

// Función para manejar el scroll
const handleScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const bottomOfPage = document.body.offsetHeight - 200;
  
  if (scrollPosition >= bottomOfPage && !loading.value && !noMorePosts.value) {
    fetchNoticias();
  }
};

// Detener audio activo
const stopActiveAudio = () => {
  if (activeAudioId.value !== null) {
    const activeCard = newsCardRefs.value.find(
      card => card.noticia?.id === activeAudioId.value
    );
    if (activeCard) {
      activeCard.stopAudio();
    }
  }
};

// Manejadores de eventos de audio
const handleAudioPlay = (id) => {
  // Si hay otro audio reproduciéndose, detenerlo
  if (activeAudioId.value !== null && activeAudioId.value !== id) {
    stopActiveAudio();
  }
  activeAudioId.value = id;
};

const handleAudioPause = (id) => {
  // No hacer nada especial al pausar
};

const handleAudioStop = (id) => {
  if (activeAudioId.value === id) {
    activeAudioId.value = null;
  }
};

// Ciclo de vida
onMounted(async () => {
  // Cargar noticias iniciales
  await fetchNoticias();
  
  // Agregar event listener para el scroll
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  // Limpiar event listener
  window.removeEventListener('scroll', handleScroll);
  
  // Detener cualquier audio activo
  stopActiveAudio();
});
</script>

<style scoped>
.home-page {
  width: 100%;
  background-color: black;
  color: white;
  margin: 0;
  padding: 0;
}

.hero-section {
  text-align: center;
  padding: 2rem 1rem;
  margin: 0 0 2rem 0;
  width: 100%;
  background-color: #2c3e50;
  color: white;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: white;
}

.hero-section p {
  font-size: 1.2rem;
  color: #ccc;
}

.news-container {
  width: 100%;
  padding: 0;
  margin: 0;
}

.news-container h2 {
  margin: 0 0 1.5rem 0;
  color: white;
  border-bottom: 2px solid #444;
  padding: 0 2rem 0.5rem 2rem;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 0 2rem;
}

.news-card {
  display: flex;
  gap: 1.5rem;
  background-color: #333;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
  width: 100%;
}

.news-card:hover {
  transform: translateY(-5px);
}

.news-image {
  flex: 0 0 300px;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-content {
  flex: 1;
  padding: 1.5rem;
}

.news-content h3 {
  margin-bottom: 0.5rem;
  color: white;
}

.news-date {
  font-size: 0.9rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.news-description {
  color: #ddd;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
  line-height: 1.5;
  max-height: 7.5em; /* Aproximadamente 5 líneas de texto */
}

.news-description.expanded {
  -webkit-line-clamp: unset;
  max-height: none;
}

.news-timestamps {
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: #bbb;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
  /* Estilos para la barra de desplazamiento */
  scrollbar-width: thin;
  scrollbar-color: #555 #333;
}

.news-timestamps::-webkit-scrollbar {
  width: 8px;
}

.news-timestamps::-webkit-scrollbar-track {
  background: #333;
  border-radius: 4px;
}

.news-timestamps::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 4px;
}

.timestamp-item {
  margin-bottom: 0.5rem;
  padding: 0.8rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
}

.timestamp-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.timestamp-item.active {
  background-color: rgba(255, 215, 0, 0.3); /* Fondo amarillo semi-transparente */
  color: #ffff00; /* Texto amarillo */
  font-weight: 500;
  border-left: 3px solid #ffff00; /* Borde izquierdo amarillo */
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2);
}

.btn-read-more {
  background-color: transparent;
  color: #2196F3;
  border: none;
  padding: 0.5rem 0;
  cursor: pointer;
  font-weight: 500;
  text-decoration: underline;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
}

.btn-read-more:hover {
  color: #0d8aee;
}

/* Estilos para el reproductor de audio personalizado */
.custom-audio-player {
  width: 100%;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.play-button {
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  margin-bottom: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.play-button:hover {
  background-color: #0d8aee;
}

.progress-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
}

.progress-container {
  width: 100%;
  height: 10px;
  background-color: #555;
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background-color: #ffff00;
  border-radius: 5px;
  transition: width 0.05s;
  pointer-events: none;
}

.progress-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background-color: #ffff00;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0,0,0,0.5);
  pointer-events: none;
  z-index: 10;
}

.audio-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.volume-control {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.volume-icon {
  margin-right: 5px;
  color: #ccc;
}

.volume-slider {
  width: 80px;
  height: 5px;
  appearance: none;
  background: #666;
  border-radius: 2px;
  outline: none;
  transition: 0.2s;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffff00;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffff00;
  cursor: pointer;
}

.speed-control {
  display: flex;
  gap: 5px;
  margin: 0 10px;
}

.speed-button {
  background-color: #444;
  color: #ccc;
  border: none;
  border-radius: 3px;
  padding: 3px 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.speed-button:hover {
  background-color: #555;
}

.speed-button.active {
  background-color: #ffff00;
  color: #333;
  font-weight: bold;
}

.time-display {
  font-size: 0.8rem;
  color: #ccc;
  white-space: nowrap;
}

.loading, .loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: white;
}

.loading-more {
  padding: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid #333;
  border-top: 3px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

.end-message {
  text-align: center;
  padding: 2rem;
  color: #ccc;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Media queries para responsividad */
@media (max-width: 768px) {
  .news-card {
    flex-direction: column;
  }
  
  .news-image {
    flex: 0 0 200px;
    max-width: 100%;
  }
  
  .news-list {
    padding: 0 1rem;
  }
  
  .audio-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .volume-control, .speed-control {
    margin-bottom: 8px;
  }
  
  .time-display {
    align-self: flex-end;
  }
}
</style>


