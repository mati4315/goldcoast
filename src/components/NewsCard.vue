<template>
  <div class="news-card" :data-id="noticia.id">
    <div class="news-image" v-if="noticia.imagen">
      <img :src="noticia.imagen" :alt="noticia.title">
    </div>
    
    <div class="news-content">
      <h3>{{ noticia.title }}</h3>
      
      <!-- Timestamps o descripción -->
      <TimestampViewer
        v-if="hasTimestamps"
        :timestamps="noticia.timestamps"
        :current-time="currentAudioTime"
        @timestamp-click="onTimestampClick"
      />
      
      <p v-else class="news-description" :class="{ 'expanded': isExpanded }">
        {{ noticia.description }}
      </p>
      
      <button 
        v-if="!hasTimestamps && needsReadMore"
        @click="toggleExpand" 
        class="btn-read-more"
      >
        {{ isExpanded ? 'Mostrar menos' : 'Leer más' }}
      </button>

      <p class="news-date">{{ formatDate(noticia.pubDate) }}</p>
      
      <!-- Reproductor de audio -->
      <AudioPlayer
        v-if="noticia.audioUrl"
        :id="noticia.id"
        :audio-url="noticia.audioUrl"
        :is-active-audio="isActiveAudio"
        @play="onAudioPlay"
        @pause="onAudioPause"
        @stop="onAudioStop"
        @timeupdate="onAudioTimeUpdate"
        @seeked="onAudioSeeked"
        ref="audioPlayerRef"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import AudioPlayer from './AudioPlayer.vue';
import TimestampViewer from './TimestampViewer.vue';

const props = defineProps({
  noticia: {
    type: Object,
    required: true
  },
  activeAudioId: {
    type: [Number, String],
    default: null
  }
});

const emit = defineEmits(['audio-play', 'audio-pause', 'audio-stop']);

// Referencias
const audioPlayerRef = ref(null);

// Estado
const isExpanded = ref(false);
const currentAudioTime = ref(0);

// Getters computados
const hasTimestamps = computed(() => {
  return props.noticia.timestamps && props.noticia.timestamps.length > 0;
});

const isActiveAudio = computed(() => {
  return props.activeAudioId === props.noticia.id;
});

const needsReadMore = computed(() => {
  if (!props.noticia.description) return false;
  return props.noticia.description.length > 722;
});

// Métodos
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
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

// Eventos de audio
const onAudioPlay = (id) => {
  emit('audio-play', id);
};

const onAudioPause = (id) => {
  emit('audio-pause', id);
};

const onAudioStop = (id) => {
  emit('audio-stop', id);
};

const onAudioTimeUpdate = (id, time) => {
  currentAudioTime.value = time;
};

const onAudioSeeked = (id, time) => {
  currentAudioTime.value = time;
};

const onTimestampClick = (index, timestamp) => {
  if (audioPlayerRef.value) {
    const time = convertTimeToSeconds(timestamp.start);
    audioPlayerRef.value.seek(time);
  }
};

// Métodos expuestos
defineExpose({
  playAudio: () => audioPlayerRef.value?.play(),
  pauseAudio: () => audioPlayerRef.value?.pause(),
  stopAudio: () => audioPlayerRef.value?.stop()
});

// Limpiar al desmontar
onUnmounted(() => {
  if (audioPlayerRef.value) {
    audioPlayerRef.value.stop();
  }
});
</script>

<style scoped>
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

@media (max-width: 768px) {
  .news-card {
    flex-direction: column;
  }
  
  .news-image {
    flex: 0 0 200px;
    max-width: 100%;
  }
}
</style> 