<template>
  <div class="custom-audio-player">
    <button 
      class="play-button" 
      @click="togglePlay"
    >
      {{ isPlaying ? '⏸️ Pausar' : '▶️ Reproducir' }}
    </button>
    
    <div class="progress-container" @click="seekAudio">
      <div class="progress-bar" :style="{ width: progressWidth }"></div>
    </div>
    
    <div class="audio-controls">
      <div class="volume-control">
        <span class="volume-icon">🔊</span>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          :value="volume" 
          @input="onVolumeChange" 
          class="volume-slider"
        />
      </div>
      <div class="speed-control">
        <button 
          v-for="speed in speedOptions" 
          :key="speed" 
          @click="setPlaybackRate(speed)"
          :class="['speed-button', { active: playbackRate === speed }]"
        >
          {{ speed }}x
        </button>
      </div>
      <div class="time-display">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  isActiveAudio: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'play', 
  'pause', 
  'stop', 
  'timeupdate', 
  'seeked'
]);

// Estado
const audioContext = ref(null);
const audioBuffer = ref(null);
const audioSource = ref(null);
const gainNode = ref(null);
const duration = ref(0);
const currentTime = ref(0);
const isPlaying = ref(false);
const startTime = ref(0);
const pauseTime = ref(0);
const volume = ref(1.0);
const playbackRate = ref(1.0);
const speedOptions = [0.8, 1.0, 1.3];

// Getters computados
const progressWidth = computed(() => {
  return `${(currentTime.value / (duration.value || 1)) * 100}%`;
});

// Inicializar contexto de audio
const initAudioContext = () => {
  if (!audioContext.value) {
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
    
    // Crear nodo de ganancia para controlar volumen
    gainNode.value = audioContext.value.createGain();
    gainNode.value.gain.value = volume.value;
    gainNode.value.connect(audioContext.value.destination);
  }
};

// Cargar el audio
const loadAudio = async () => {
  try {
    const fullUrl = getAudioUrl(props.audioUrl);
    const response = await fetch(fullUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.value.decodeAudioData(arrayBuffer);
    
    audioBuffer.value = buffer;
    duration.value = buffer.duration;
    
    return buffer;
  } catch (error) {
    console.error('Error al cargar el audio:', error);
  }
};

// Reproducir audio
const playAudio = () => {
  if (!audioBuffer.value) return;
  
  // Crear nueva fuente de audio
  const source = audioContext.value.createBufferSource();
  source.buffer = audioBuffer.value;
  
  // Configurar velocidad
  source.playbackRate.value = playbackRate.value;
  
  // Conectar al nodo de ganancia
  source.connect(gainNode.value);
  
  // Calcular tiempo de inicio
  const offset = pauseTime.value || 0;
  source.start(0, offset);
  
  // Guardar referencias
  audioSource.value = source;
  isPlaying.value = true;
  
  // Guardar tiempo de inicio para calcular progreso
  startTime.value = audioContext.value.currentTime - offset;
  pauseTime.value = 0;
  
  // Configurar actualización de progreso
  setupProgressUpdate();
  
  // Configurar evento para cuando termina el audio
  source.onended = () => {
    if (audioSource.value === source) {  // Solo si es la misma fuente
      stopAudio();
    }
  };
  
  // Emitir evento de reproducción
  emit('play', props.id);
};

// Pausar audio
const pauseAudio = () => {
  if (audioSource.value) {
    // Guardar tiempo de pausa
    pauseTime.value = currentTime.value;
    
    // Detener fuente
    audioSource.value.stop();
    audioSource.value = null;
    isPlaying.value = false;
    
    // Emitir evento de pausa
    emit('pause', props.id);
  }
};

// Detener audio
const stopAudio = () => {
  if (audioSource.value) {
    audioSource.value.stop();
    audioSource.value = null;
  }
  
  isPlaying.value = false;
  currentTime.value = 0;
  pauseTime.value = 0;
  
  // Emitir evento de parada
  emit('stop', props.id);
};

// Alternar entre reproducir y pausar
const togglePlay = async () => {
  initAudioContext();
  
  if (isPlaying.value) {
    pauseAudio();
  } else {
    if (!audioBuffer.value) {
      await loadAudio();
    }
    playAudio();
  }
};

// Buscar en una posición específica
const playFromPosition = (time) => {
  if (!audioBuffer.value) return;
  
  const wasPlaying = isPlaying.value;
  
  if (wasPlaying) {
    audioSource.value.stop();
  }
  
  // Crear nueva fuente
  const source = audioContext.value.createBufferSource();
  source.buffer = audioBuffer.value;
  source.playbackRate.value = playbackRate.value;
  source.connect(gainNode.value);
  
  // Iniciar desde la posición indicada
  source.start(0, time);
  
  // Actualizar referencias
  audioSource.value = source;
  startTime.value = audioContext.value.currentTime - time;
  pauseTime.value = 0;
  isPlaying.value = true;
  
  // Configurar evento onended
  source.onended = () => {
    if (audioSource.value === source) {
      stopAudio();
    }
  };
  
  // Emitir evento de búsqueda
  emit('seeked', props.id, time);
};

// Manejar clic en barra de progreso
const seekAudio = (event) => {
  const container = event.currentTarget;
  const rect = container.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const percentage = x / rect.width;
  
  const newTime = percentage * duration.value;
  
  if (isPlaying.value || pauseTime.value > 0) {
    playFromPosition(newTime);
  } else {
    pauseTime.value = newTime;
    currentTime.value = newTime;
  }
};

// Configurar actualización de progreso
const setupProgressUpdate = () => {
  const updateProgress = () => {
    if (isPlaying.value) {
      currentTime.value = audioContext.value.currentTime - startTime.value;
      
      // Emitir evento de actualización de tiempo
      emit('timeupdate', props.id, currentTime.value);
      
      // Continuar actualizando
      requestAnimationFrame(updateProgress);
    }
  };
  
  requestAnimationFrame(updateProgress);
};

// Cambiar volumen
const onVolumeChange = (event) => {
  const newVolume = parseFloat(event.target.value);
  volume.value = newVolume;
  
  if (gainNode.value) {
    gainNode.value.gain.value = newVolume;
  }
};

// Cambiar velocidad de reproducción
const setPlaybackRate = (rate) => {
  playbackRate.value = rate;
  
  if (isPlaying.value && audioSource.value) {
    // Guardar posición actual
    const currentPos = currentTime.value;
    
    // Aplicar nueva velocidad sin detener
    audioSource.value.playbackRate.value = rate;
  }
};

// Formatear tiempo (segundos a MM:SS)
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

// Lifecycle hooks
onMounted(() => {
  initAudioContext();
});

onUnmounted(() => {
  // Detener reproducción al desmontar
  if (audioSource.value) {
    audioSource.value.stop();
  }
});

// Exponer métodos para el componente padre
defineExpose({
  play: playAudio,
  pause: pauseAudio,
  stop: stopAudio,
  seek: playFromPosition,
  setVolume: (vol) => {
    volume.value = vol;
    if (gainNode.value) gainNode.value.gain.value = vol;
  }
});

// Vigilar si este audio es el activo
watch(() => props.isActiveAudio, (isActive) => {
  if (!isActive && isPlaying.value) {
    pauseAudio();
  }
}, { immediate: true });
</script>

<style scoped>
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

.progress-container {
  width: 100%;
  height: 10px;
  background-color: #555;
  border-radius: 5px;
  margin-bottom: 10px;
  cursor: pointer;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #ffff00;
  border-radius: 5px;
  transition: width 0.1s;
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

/* Media queries para responsividad */
@media (max-width: 768px) {
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