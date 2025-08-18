import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Estilos globais (reset + utilitários que você já tem no main.css)
import './assets/styles/main.css'

const app = createApp(App)

// Ativar o Pinia (store global)
app.use(createPinia())

// Montar a aplicação no index.html (#app)
app.mount('#app')
