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
        <div v-for="noticia in noticias" :key="noticia.id" class="news-card" :data-id="noticia.id">
          <div class="news-image" v-if="noticia.imagen">
            <img :src="noticia.imagen" :alt="noticia.title">
          </div>
          <div class="news-content">
            <h3>
              {{ noticia.title }}
              <button 
                class="translate-icon global-translate"
                :class="{ 'active': noticia.showAllTranslations }"
                @click.stop="toggleAllTranslations(noticia)"
                :title="noticia.showAllTranslations ? 
                  (selectedLanguage === 'es' ? 'Ver todos en português' : 'Ver todos en español') : 
                  (selectedLanguage === 'es' ? 'Ver todos en español' : 'Ver todos en português')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                </svg>
              </button>
            </h3>
            
            <div class="news-timestamps" v-if="noticia.timestamps && noticia.timestamps.length > 0 && showTimestamps">
              <div 
                v-for="(timestamp, index) in noticia.timestamps" 
                :key="index"
                :class="{ 
                  'timestamp-item': true, 
                  'active': playingNoticiaId === noticia.id && currentTimestampIndex[noticia.id] === index 
                }"
                @click="seekToTimestamp(noticia.id, timestamp)"
              >
                <span>{{ getTimestampText(timestamp) }}</span>
                <button 
                  class="translate-icon"
                  :class="{ 'active': timestamp.showTranslation }"
                  @click.stop="toggleTranslation(timestamp)"
                  :title="timestamp.showTranslation ? 
                    (selectedLanguage === 'es' ? 'Ver en português' : 'Ver en español') : 
                    (selectedLanguage === 'es' ? 'Ver en español' : 'Ver en português')"
                >
                <svg xmlns="http://www.w3.org/2000/svg" height="20" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
</svg>
                </button>
              </div>
            </div>
            
            <p v-else class="news-description" :class="{ 'expanded': expandedNews.includes(noticia.id) }">
              {{ noticia.description }}
            </p>
            
            <button 
              v-if="!noticia.timestamps && needsReadMore(noticia.description)"
              @click="toggleExpand(noticia.id)" 
              class="btn-read-more"
            >
              {{ expandedNews.includes(noticia.id) ? 'Mostrar menos' : 'Leer más' }}
            </button>
            
            <p class="news-date">{{ formatDate(noticia.pubDate) }}</p>
            
            <!-- Custom audio controls -->
            <div v-if="noticia.audioUrl" class="custom-audio-player">
              <button 
                class="play-button" 
                @click="togglePlay(noticia.id, noticia.audioUrl)"
              >
                {{ isPlaying(noticia.id) ? '⏸️ Pausar' : '▶️ Reproducir' }}
              </button>
              
              <div class="progress-wrapper">
                <div 
                  class="progress-container" 
                  ref="progressContainer"
                  @mousedown="startProgressDrag($event, noticia.id)"
              
                >
                  <div class="progress-bar" :style="{ width: getProgressWidth(noticia.id) }"></div>
                  <div 
                    v-if="isDragging && currentDragId === noticia.id" 
                    class="progress-handle"
                    :style="{ left: getProgressWidth(noticia.id) }"
                  ></div>
                </div>
              </div>
              
              <div class="audio-controls">
                <div class="volume-control">
                  <span class="volume-icon">🔊</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    :value="getVolume(noticia.id)" 
                    @input="setVolume($event, noticia.id)" 
                    class="volume-slider"
                  />
                </div>
                <div class="speed-control">
                  <button 
                    v-for="speed in [0.8, 1.0, 1.2]" 
                    :key="speed" 
                    @click="setPlaybackRate(noticia.id, speed)"
                    :class="['speed-button', { active: getPlaybackRate(noticia.id) === speed }]"
                  >
                    {{ speed }}x
                  </button>
                </div>
                <div class="time-display">
                  {{ formatTime(getCurrentTime(noticia.id)) }} / {{ formatTime(getDuration(noticia.id)) }}
                </div>
              </div>
            </div>
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
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue';
import api from '../config/strapi';
import AppHeader from '../components/AppHeader.vue';

// Props para las configuraciones
const props = defineProps({
  configurations: {
    type: Object,
    required: true
  }
});

// Estado
const noticias = ref([]);
const loading = ref(true);
const page = ref(1);
const pageSize = 5;
const noMorePosts = ref(false);
const observer = ref(null);
const expandedNews = ref([]);
const currentTimestampIndex = ref({});
const playingNoticiaId = ref(null);

// Referencias a las configuraciones del header
const headerRef = ref(null);

// Computed properties para las configuraciones
const showTimestamps = computed(() => props.configurations.showTimestamps);
const selectedLanguage = computed(() => props.configurations.language);

// Estado para Web Audio API
const audioContext = ref(null);
const audioBuffers = reactive({});
const audioSources = reactive({});
const audioDurations = reactive({});
const audioStartTimes = reactive({});
const audioPauseTimes = reactive({});
const audioProgress = reactive({});
const audioVolumes = reactive({});
const audioGainNodes = reactive({});
const audioPlaybackRates = reactive({});

// Estado para el arrastre de la barra de progreso
const isDragging = ref(false);
const currentDragId = ref(null);
const progressContainer = ref(null);
const frameId = ref(null);

// Variables para el estado de reproducción antes del arrastre
const wasPlayingBeforeDrag = ref(false);

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
      
      // Precargar audio para las nuevas noticias
      nuevosPosts.forEach(noticia => {
        if (noticia.audioUrl) {
          preloadAudio(noticia.id, noticia.audioUrl);
        }
      });
    }
  } catch (error) {
    console.error('Error al cargar las noticias:', error);
  } finally {
    loading.value = false;
  }
};

// Funciones para Web Audio API
const initAudioContext = () => {
  if (!audioContext.value) {
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
  }
};

const preloadAudio = async (id, url) => {
  try {
    const fullUrl = getAudioUrl(url);
    const response = await fetch(fullUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.value.decodeAudioData(arrayBuffer);
    
    audioBuffers[id] = audioBuffer;
    audioDurations[id] = audioBuffer.duration;
    audioProgress[id] = 0;
    audioVolumes[id] = 1.0; // Volumen por defecto (máximo)
    audioPlaybackRates[id] = 1.0; // Velocidad por defecto (normal)
    
    return audioBuffer;
  } catch (error) {
    console.error('Error al precargar el audio:', error);
  }
};

const togglePlay = async (id, url) => {
  initAudioContext();
  
  // Si está reproduciendo otra noticia, pararla
  if (playingNoticiaId.value !== null && playingNoticiaId.value !== id) {
    stopAudio(playingNoticiaId.value);
  }
  
  // Si ya está reproduciendo esta noticia, pausarla
  if (isPlaying(id)) {
    pauseAudio(id);
    return;
  }
  
  // Iniciar reproducción
  if (!audioBuffers[id]) {
    await preloadAudio(id, url);
  }
  
  playAudio(id);
};

const playAudio = (id) => {
  if (!audioBuffers[id]) return;
  
  const source = audioContext.value.createBufferSource();
  source.buffer = audioBuffers[id];
  
  // Configurar velocidad de reproducción
  source.playbackRate.value = audioPlaybackRates[id] || 1.0;
  
  // Configurar nodo de ganancia para el volumen
  const gainNode = audioContext.value.createGain();
  gainNode.gain.value = audioVolumes[id] || 1.0;
  
  // Conectar: source -> gainNode -> destination
  source.connect(gainNode);
  gainNode.connect(audioContext.value.destination);
  
  // Guardar referencias
  audioSources[id] = source;
  audioGainNodes[id] = gainNode;
  
  // Calcular tiempo de inicio
  const offset = audioPauseTimes[id] || 0;
  source.start(0, offset);
  
  // Guardar tiempo de inicio para calcular el progreso
  audioStartTimes[id] = audioContext.value.currentTime - offset;
  delete audioPauseTimes[id];
  
  // Establecer como noticia activa
  playingNoticiaId.value = id;
  
  // Configurar actualización de progreso
  setupProgressUpdate(id);
  
  // Configurar eventos de timestamp
  setupTimestampEvents(id);
  
  // Manejar cuando termina el audio
  source.onended = () => {
    stopAudio(id);
  };
};

const pauseAudio = (id) => {
  if (audioSources[id]) {
    // Guardar el tiempo de pausa para continuar desde ahí
    audioPauseTimes[id] = getCurrentTime(id);
    
    // Detener la fuente de audio
    audioSources[id].stop();
    delete audioSources[id];
    
    // Limpiar la noticia activa si es la misma
    if (playingNoticiaId.value === id) {
      playingNoticiaId.value = null;
    }
  }
};

const stopAudio = (id) => {
  if (audioSources[id]) {
    audioSources[id].stop();
    delete audioSources[id];
    delete audioPauseTimes[id];
    audioProgress[id] = 0;
    
    // Limpiar la noticia activa si es la misma
    if (playingNoticiaId.value === id) {
      playingNoticiaId.value = null;
    }
  }
};

const setupProgressUpdate = (id) => {
  const updateProgress = () => {
    if (isPlaying(id)) {
      const currentTime = getCurrentTime(id);
      const playbackRate = getPlaybackRate(id);
      const adjustedTime = currentTime * playbackRate;
      audioProgress[id] = adjustedTime / audioDurations[id];
      
      // Continuar actualizando
      requestAnimationFrame(updateProgress);
    }
  };
  
  requestAnimationFrame(updateProgress);
};

const setupTimestampEvents = (id) => {
  const noticia = noticias.value.find(n => n.id === id);
  if (!noticia || !noticia.timestamps || noticia.timestamps.length === 0) return;
  
  // Usar requestAnimationFrame para verificar continuamente el tiempo actual
  const checkTimestamps = () => {
    if (!isPlaying(id)) return;
    
    const currentTime = getCurrentTime(id);
    const playbackRate = getPlaybackRate(id);
    const timestamps = noticia.timestamps;
    
    let activeIndex = -1;
    for (let i = 0; i < timestamps.length; i++) {
      const startTime = convertTimeToSeconds(timestamps[i].start) / playbackRate;
      const endTime = convertTimeToSeconds(timestamps[i].end) / playbackRate;
      
      if (currentTime >= startTime && currentTime <= endTime) {
        activeIndex = i;
        break;
      }
    }
    
    // Actualizar el índice del timestamp activo
    if (activeIndex !== -1 && currentTimestampIndex.value[id] !== activeIndex) {
      currentTimestampIndex.value[id] = activeIndex;
    }
    
    // Seguir verificando
    requestAnimationFrame(checkTimestamps);
  };
  
  requestAnimationFrame(checkTimestamps);
};

const getCurrentTime = (id) => {
  if (isPlaying(id)) {
    return audioContext.value.currentTime - audioStartTimes[id];
  }
  return audioPauseTimes[id] || 0;
};

const getDuration = (id) => {
  return audioDurations[id] || 0;
};

const getProgressWidth = (id) => {
  return `${(audioProgress[id] || 0) * 100}%`;
};

const isPlaying = (id) => {
  return playingNoticiaId.value === id && audioSources[id] !== undefined;
};

const playFromPosition = (id, startTime, updateSourceOnly = false) => {
  // Esta función centraliza la lógica para iniciar la reproducción desde una posición específica
  if (!audioBuffers[id]) return;
  
  try {
    // Si hay otro audio reproduciéndose, detenerlo primero
    if (playingNoticiaId.value !== null && playingNoticiaId.value !== id) {
      stopAudio(playingNoticiaId.value);
    }
    
    // Si hay una fuente de audio activa para este ID, detenerla primero
    if (audioSources[id]) {
      audioSources[id].stop();
      delete audioSources[id];
    }
    
    // Crear una nueva fuente de audio
    const source = audioContext.value.createBufferSource();
    source.buffer = audioBuffers[id];
    
    // Aplicar la velocidad de reproducción actual
    source.playbackRate.value = audioPlaybackRates[id] || 1.0;
    
    // Usar el nodo de ganancia existente o crear uno nuevo
    let gainNode = audioGainNodes[id];
    if (!gainNode) {
      gainNode = audioContext.value.createGain();
      gainNode.gain.value = audioVolumes[id] || 1.0;
      gainNode.connect(audioContext.value.destination);
      audioGainNodes[id] = gainNode;
    }
    
    // Conectar la fuente al nodo de ganancia
    source.connect(gainNode);
    
    // Iniciar reproducción desde el punto indicado
    source.start(0, startTime);
    
    // Actualizar la referencia a la fuente de audio
    audioSources[id] = source;
    
    // Actualizar el tiempo de inicio para el cálculo del progreso
    audioStartTimes[id] = audioContext.value.currentTime - startTime;
    delete audioPauseTimes[id];
    
    // Configurar evento para cuando termine el audio
    source.onended = () => {
      stopAudio(id);
    };
    
    // Actualizar el progreso
    audioProgress[id] = startTime / audioDurations[id];
    
    // Establecer como noticia activa
    playingNoticiaId.value = id;
    
    // Configurar actualización de progreso
    setupProgressUpdate(id);
    
    // Configurar eventos de timestamp
    setupTimestampEvents(id);
    
    return true;
  } catch (error) {
    console.error('Error al reproducir desde posición específica:', error);
    return false;
  }
};

const seekAudio = (event, id) => {
  if (!audioBuffers[id]) return;
  
  // Detener cualquier otro audio que esté reproduciéndose en otra noticia
  if (playingNoticiaId.value !== null && playingNoticiaId.value !== id) {
    stopAudio(playingNoticiaId.value);
  }
  
  const container = event.currentTarget;
  const rect = container.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const width = rect.width;
  const percentage = x / width;
  
  const playbackRate = getPlaybackRate(id);
  const newTime = (percentage * audioDurations[id]) / playbackRate;
  
  // Siempre iniciar la reproducción desde la nueva posición
  playFromPosition(id, newTime);
};

const seekToTimestamp = (id, timestamp) => {
  if (!audioBuffers[id]) return;
  
  // Calcular el tiempo objetivo
  const targetTime = convertTimeToSeconds(timestamp.start);
  
  // Detener cualquier otro audio que esté reproduciéndose en otra noticia
  if (playingNoticiaId.value !== null && playingNoticiaId.value !== id) {
    stopAudio(playingNoticiaId.value);
  }
  
  // Siempre usar playFromPosition para mantener la reproducción
  playFromPosition(id, targetTime);
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

// Formatear tiempo de audio (segundos a mm:ss)
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === undefined) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

// Convertir formato de tiempo "mm:ss" a segundos
const convertTimeToSeconds = (timeString) => {
  if (!timeString) return 0;
  
  const parts = timeString.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return parseFloat(timeString);
};

const getVolume = (id) => {
  return audioVolumes[id] !== undefined ? audioVolumes[id] : 1.0;
};

const setVolume = (event, id) => {
  const volume = parseFloat(event.target.value);
  audioVolumes[id] = volume;
  
  // Aplicar el volumen si hay un nodo de ganancia activo
  if (audioGainNodes[id]) {
    audioGainNodes[id].gain.value = volume;
  }
};

const getPlaybackRate = (id) => {
  return audioPlaybackRates[id] !== undefined ? audioPlaybackRates[id] : 1.0;
};

const setPlaybackRate = (id, rate) => {
  // Detener cualquier otro audio que esté reproduciéndose
  if (playingNoticiaId.value !== null && playingNoticiaId.value !== id) {
    stopAudio(playingNoticiaId.value);
  }
  
  // Guardar la velocidad de reproducción anterior
  const prevRate = audioPlaybackRates[id] || 1.0;
  // Actualizar la velocidad de reproducción
  audioPlaybackRates[id] = rate;
  
  // Si hay un audio actualmente reproduciéndose para esta noticia
  if (isPlaying(id) && audioSources[id]) {
    // Aplicar la nueva velocidad directamente a la fuente de audio sin detenerla
    audioSources[id].playbackRate.value = rate;
  } else if (audioBuffers[id]) {
    // Si no está reproduciendo pero tiene un buffer cargado, iniciar la reproducción
    audioPauseTimes[id] = audioPauseTimes[id] || 0;
    playAudio(id);
  }
};

// Función para manejar el inicio del arrastre en la barra de progreso
const startProgressDrag = (event, id) => {
  // Prevenir comportamiento por defecto
  event.preventDefault();
  
  // Si hay otro audio reproduciéndose, detenerlo
  if (playingNoticiaId.value !== null && playingNoticiaId.value !== id) {
    stopAudio(playingNoticiaId.value);
  }
  
  // Guardar el estado de reproducción actual
  wasPlayingBeforeDrag.value = isPlaying(id);
  
  // Si el audio está reproduciéndose, pausarlo temporalmente
  if (wasPlayingBeforeDrag.value) {
    pauseAudio(id);
  }
  
  // Activar el modo de arrastre
  isDragging.value = true;
  currentDragId.value = id;
  
  // Actualizar la posición inicial del arrastre
  updateProgressPosition(event);
  
  // Agregar event listeners para el movimiento y fin del arrastre
  if (event.type === 'mousedown') {
    document.addEventListener('mousemove', handleProgressDrag);
    document.addEventListener('mouseup', endProgressDrag);
  } else if (event.type === 'touchstart') {
    document.addEventListener('touchmove', handleProgressDrag, { passive: false });
    document.addEventListener('touchend', endProgressDrag);
  }
};

// Función para manejar el arrastre continuo
const handleProgressDrag = (event) => {
  // Prevenir comportamiento por defecto y propagación
  event.preventDefault();
  
  // Actualizar la posición durante el arrastre
  updateProgressPosition(event);
};

// Función para actualizar la posición del audio durante el arrastre
const updateProgressPosition = (event) => {
  if (!isDragging.value || !currentDragId.value) return;

  if (frameId.value) {
    cancelAnimationFrame(frameId.value);
  }

  frameId.value = requestAnimationFrame(() => {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const container = document.querySelector(`.news-card[data-id="${currentDragId.value}"] .progress-container`);
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    
    const playbackRate = getPlaybackRate(currentDragId.value);
    const adjustedTime = (percentage * audioDurations[currentDragId.value]) / playbackRate;
    
    // Actualizar solo el progreso visual y el tiempo de pausa
    audioProgress[currentDragId.value] = percentage;
    audioPauseTimes[currentDragId.value] = adjustedTime;
  });
};

// Función para finalizar el arrastre
const endProgressDrag = () => {
  // Si no estábamos arrastrando, salir
  if (!isDragging.value || !currentDragId.value) return;
  
  const id = currentDragId.value;
  const newTime = audioPauseTimes[id];
  
  // Reanudar la reproducción si estaba reproduciéndose antes
  if (wasPlayingBeforeDrag.value) {
    playFromPosition(id, newTime);
  } else {
    // Si no estaba reproduciéndose, actualizar solo el progreso visual
    audioProgress[id] = newTime / audioDurations[id];
  }
  
  // Limpiar estado y event listeners
  isDragging.value = false;
  wasPlayingBeforeDrag.value = false;
  
  if (frameId.value) {
    cancelAnimationFrame(frameId.value);
    frameId.value = null;
  }
  
  document.removeEventListener('mousemove', handleProgressDrag);
  document.removeEventListener('mouseup', endProgressDrag);
  document.removeEventListener('touchmove', handleProgressDrag);
  document.removeEventListener('touchend', endProgressDrag);
  
  currentDragId.value = null;
};

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

// Función para obtener el texto del timestamp según el idioma seleccionado
const getTimestampText = (timestamp) => {
  if (selectedLanguage.value === 'pt' && timestamp.showTranslation) {
    return timestamp.text_pt;
  } else if (selectedLanguage.value === 'es' && timestamp.showTranslation) {
    return timestamp.text_es;
  }
  return timestamp.text;
};

// Función para alternar entre traducciones
const toggleTranslation = (timestamp) => {
  timestamp.showTranslation = !timestamp.showTranslation;
};

// Función para alternar todas las traducciones de una noticia
const toggleAllTranslations = (noticia) => {
  if (!noticia.timestamps) return;
  
  noticia.showAllTranslations = !noticia.showAllTranslations;
  
  // Actualizar todos los timestamps de la noticia
  noticia.timestamps.forEach(timestamp => {
    timestamp.showTranslation = noticia.showAllTranslations;
  });
};

// Ciclo de vida
onMounted(async () => {
  // Inicializar contexto de audio
  initAudioContext();
  
  // Cargar noticias iniciales
  await fetchNoticias();
  
  // Agregar event listener para el scroll
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  // Limpiar event listener
  window.removeEventListener('scroll', handleScroll);
  
  // Limpiar event listeners de arrastre por si acaso
  document.removeEventListener('mousemove', handleProgressDrag);
  document.removeEventListener('mouseup', endProgressDrag);
  document.removeEventListener('touchmove', handleProgressDrag);
  document.removeEventListener('touchend', endProgressDrag);
  
  // Detener todos los audios en reproducción
  Object.keys(audioSources).forEach(id => {
    stopAudio(id);
  });
  
  // Cerrar el contexto de audio si existe
  if (audioContext.value) {
    audioContext.value.close();
  }
});
</script>

<style scoped>
.home-page {
  width: 100%;
  background-color: black;
  color: white;
  margin: 0;
  padding: 0;
  padding-top: 80px; /* Ajusta este valor según la altura de tu header */
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
  padding: 0 6rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.news-date {
  font-size: 0.9rem;
  color: #ccc;
  margin-bottom: 1rem;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
  padding: 0.2rem;
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
   transition: width 0.2s ease-out; /* Transición suave */
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
    border-radius: 0;
    margin: 0.5rem 0;
    box-shadow: none;
  }
  
  .news-image {
    flex: 0 0 200px;
    max-width: 100%;
  }
  
  .news-list {
    padding: 0;
    margin: 0;
    gap: 0.5rem;
  }

  .news-content {
    padding: 1rem;
  }

  .news-container h2 {
    padding: 0 1rem 0.5rem 1rem;
    margin: 0 0 1rem 0;
  }

  .home-page {
    padding-top: 120px; /* Aumentar el padding en móvil debido al header más alto */
  }
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

.translate-icon {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 4px;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: all 0.2s;
}

.translate-icon:hover {
  opacity: 1;
}

.translate-icon.active {
  color: #ffff00;
  opacity: 1;
}

.global-translate {
  padding: 2px;
  margin-left: 0.5rem;
}

.global-translate.active {
  color: #ffff00;
  opacity: 1;
}
</style>


