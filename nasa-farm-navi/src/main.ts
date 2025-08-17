import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// Importar estilos globais
import './assets/styles/main.css';

// Criar aplicação Vue
const app = createApp(App);

// Criar e usar Pinia para gerenciamento de estado
const pinia = createPinia();
app.use(pinia);

// Configurações globais (opcional)
app.config.globalProperties.$appName = 'NASA Farm Navigator';
app.config.globalProperties.$version = '1.0.0';

// Tratamento de erros global
app.config.errorHandler = (err, instance, info) => {
  console.error('Erro global:', err);
  console.error('Componente:', instance);
  console.error('Info:', info);
};

// Montar aplicação
app.mount('#app');