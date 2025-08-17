// src/main.ts

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Criar Pinia PRIMEIRO
const pinia = createPinia()

// Fazer Pinia global para debug
window.__pinia = pinia

// Importar App DEPOIS
import App from './App.vue'

// Criar app
const app = createApp(App)

// Usar Pinia
app.use(pinia)

// Montar
app.mount('#app')

console.log('✅ App montado com Pinia global!')