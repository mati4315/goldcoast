<template>
  <div class="home-page">
    <div class="hero-section">

    </div>
    
    <div class="news-container">
      <h2>Últimas Noticias</h2>
      
      <!-- Loading indicator -->
      <div v-if="loading && noticias.length === 0" class="loading">
        <div class="spinner"></div>
        <p>Cargando noticias...</p>
      </div>
      
      <!-- News List -->
      <div class="news-list">
        <div v-for="noticia in noticias" :key="noticia.id" class="news-card">
          <div class="news-image" v-if="noticia.imagen">
            <img :src="noticia.imagen" :alt="noticia.title">
          </div>
          <div class="news-content">
            <h3>{{ noticia.title }}</h3>
            <p class="news-date">{{ formatDate(noticia.pubDate) }}</p>
            <p class="news-description" :class="{ 'expanded': expandedNews.includes(noticia.id) }">
              {{ noticia.description }}
            </p>
            <button 
              v-if="needsReadMore(noticia.description)"
              @click="toggleExpand(noticia.id)" 
              class="btn-read-more"
            >
              {{ expandedNews.includes(noticia.id) ? 'Mostrar menos' : 'Leer más' }}
            </button>
            <audio v-if="noticia.audioUrl" controls class="news-audio">
              <source :src="getAudioUrl(noticia.audioUrl)" type="audio/mpeg">
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>
        </div>
        
        <!-- Loading more indicator -->
        <div v-if="loading && noticias.length > 0" class="loading-more">
          <div class="spinner-small"></div>
          <p>Cargando más noticias...</p>
        </div>
        
        <!-- End message -->
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

// Estado
const noticias = ref([]);
const loading = ref(true);
const page = ref(1);
const pageSize = 5;
const noMorePosts = ref(false);
const observer = ref(null);
const expandedNews = ref([]);

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

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

// Obtener URL completa para audio
const getAudioUrl = (audioPath) => {
  if (!audioPath) return '';
  if (audioPath.startsWith('http')) return audioPath;
  return `http://localhost:1337${audioPath}`;
};

// Función para manejar el scroll
const handleScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const bottomOfPage = document.body.offsetHeight - 200;
  
  if (scrollPosition >= bottomOfPage && !loading.value && !noMorePosts.value) {
    fetchNoticias();
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
});

// Función para expandir o contraer la descripción de la noticia
const toggleExpand = (id) => {
  if (expandedNews.value.includes(id)) {
    expandedNews.value = expandedNews.value.filter((i) => i !== id);
  } else {
    expandedNews.value.push(id);
  }
};

// Función para verificar si el texto necesita el botón "Leer más"
const needsReadMore = (text) => {
  if (!text) return false;
  return text.length > 722;
};
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

.news-audio {
  width: 100%;
  margin-top: 1rem;
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
}
</style>


