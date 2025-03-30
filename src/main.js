import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Crear la aplicación
const app = createApp(App)

// Usar los plugins
app.use(createPinia())
app.use(router)

// Montar la aplicación
app.mount('#app')
