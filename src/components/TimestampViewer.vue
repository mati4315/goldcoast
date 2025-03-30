<template>
  <div class="news-timestamps">
    <div 
      v-for="(timestamp, index) in timestamps" 
      :key="index"
      :class="{ 
        'timestamp-item': true, 
        'active': currentIndex === index 
      }"
      @click="onTimestampClick(index, timestamp)"
    >
      {{ timestamp.word }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  timestamps: {
    type: Array,
    required: true
  },
  currentTime: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['timestamp-click']);

const currentIndex = ref(-1);

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

// Actualizar el timestamp activo basado en el tiempo actual
const updateActiveTimestamp = (time) => {
  if (!props.timestamps || props.timestamps.length === 0) return;
  
  let found = -1;
  for (let i = 0; i < props.timestamps.length; i++) {
    const startTime = convertTimeToSeconds(props.timestamps[i].start);
    const endTime = convertTimeToSeconds(props.timestamps[i].end);
    
    if (time >= startTime && time <= endTime) {
      found = i;
      break;
    }
  }
  
  currentIndex.value = found;
};

// Manejar clic en un timestamp
const onTimestampClick = (index, timestamp) => {
  currentIndex.value = index;
  emit('timestamp-click', index, timestamp);
};

// Observar cambios en el tiempo actual
watch(() => props.currentTime, (newTime) => {
  updateActiveTimestamp(newTime);
}, { immediate: true });
</script>

<style scoped>
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
</style> 