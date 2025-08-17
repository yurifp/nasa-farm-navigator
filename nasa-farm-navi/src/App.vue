<template>
  <div id="app" class="nasa-farm-app">
    <!-- Loading -->
    <div v-if="isLoading" class="loading">
      <h2>🚀 Carregando NASA Farm Navigator...</h2>
    </div>

    <!-- App Content -->
    <template v-else>
      <!-- Header -->
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            <span class="title-icon">🚀</span>
            NASA Farm Navigator
          </h1>
          <p class="app-subtitle">
            Use dados de satélite da NASA para gerenciar sua fazenda virtual!
          </p>
        </div>
      </header>

      <!-- Tutorial -->
      <div v-if="showTutorial" class="tutorial">
        <button class="tutorial-close" @click="showTutorial = false">✕</button>
        <h3>📚 Como Jogar:</h3>
        <ul>
          <li>🌱 <strong>Plantar:</strong> Selecione uma célula vazia e clique em "Plantar" (10 moedas)</li>
          <li>💧 <strong>Irrigar:</strong> Use dados de umidade do satélite para decidir quando irrigar (5 moedas)</li>
          <li>🌾 <strong>Fertilizar:</strong> Aplique fertilizante para acelerar crescimento (15 moedas)</li>
          <li>🛰️ <strong>Análise Satelital:</strong> Obtenha dados atualizados da NASA sobre condições</li>
          <li>🌤️ <strong>Clima:</strong> Muda automaticamente e afeta o crescimento das culturas</li>
          <li>✨ <strong>Colher:</strong> Colha quando as plantas estiverem 100% prontas para ganhar moedas</li>
        </ul>
      </div>

      <!-- Conteúdo principal -->
      <main class="app-main">
        <div class="game-container">
          <!-- Grid da fazenda -->
          <div class="game-board">
            <FarmGrid
              :cells="farmGrid"
              :selected-cell="selectedCell"
              @cell-click="handleCellClick"
            />
          </div>

          <!-- Sidebar -->
          <aside class="game-sidebar">
            <GameStats
              :stats="gameState"
              :planted-cells="plantedCellsCount"
              :ready-to-harvest="readyToHarvestCount"
              :average-growth="averageGrowth"
            />
            
            <NasaDataPanel
              :data="satelliteData"
              :weather="currentWeather"
            />
            
            <ControlPanel
              :disabled-actions="disabledActions"
              :is-paused="isPaused"
              @action="handleGameAction"
              @toggle-pause="togglePause"
              @show-help="showTutorial = true"
            />
          </aside>
        </div>
      </main>

      <!-- Sistema de notificações -->
      <TransitionGroup name="notification" tag="div" class="notifications">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification', `notification-${notification.type}`]"
        >
          <strong>{{ notification.title }}</strong>
          <p>{{ notification.message }}</p>
        </div>
      </TransitionGroup>
    </template>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/gameStore'; // Importar DIRETO!


import FarmGrid from '@/components/FarmGrid.vue';
import GameStats from '@/components/GameStats.vue';
import NasaDataPanel from '@/components/NasaDataPanel.vue';
import ControlPanel from '@/components/ControlPanel.vue';


const store = useGameStore();

// Estado local
const showTutorial = ref(true);
const isLoading = ref(true);
let gameLoop: number | null = null;

// Refs reativas para o template - com valores padrão para evitar erros
const farmGrid = ref<any[]>([]);
const selectedCell = ref<number | null>(null);
const gameState = ref({
  coins: 100,
  harvests: 0,
  score: 0,
  day: 1,
  level: 1,
  experience: 0
});
const satelliteData = ref({
  temperature: 25,
  humidity: 60,
  uvIndex: 6,
  soilMoisture: 50,
  precipitation: 0,
  windSpeed: 10
});
const notifications = ref<any[]>([]);
const isPaused = ref(false);
const currentWeather = ref({
  id: 1,
  name: 'Ensolarado',
  icon: '☀️',
  description: 'Perfeito para crescimento',
  growthModifier: 1.2,
  waterNeed: 1.5,
  pestRisk: 0.2
});
const plantedCellsCount = ref(0);
const readyToHarvestCount = ref(0);
const averageGrowth = ref(0);

// Computed - ações desabilitadas (com verificações seguras)
const disabledActions = computed(() => {
  // Verificações de segurança
  if (!farmGrid.value || farmGrid.value.length === 0) {
    return {
      plant: true,
      water: true,
      fertilize: true,
      harvest: true
    };
  }

  const cellIndex = selectedCell.value;
  
  // Se não há célula selecionada
  if (cellIndex === null || cellIndex === undefined || cellIndex < 0 || cellIndex >= farmGrid.value.length) {
    return {
      plant: true,
      water: true,
      fertilize: true,
      harvest: true
    };
  }
  
  // Pegar a célula com verificação
  const cell = farmGrid.value[cellIndex];
  
  // Se a célula não existe
  if (!cell) {
    return {
      plant: true,
      water: true,
      fertilize: true,
      harvest: true
    };
  }
  
  // Retornar estado dos botões baseado na célula
  return {
    plant: cell.type !== 'empty' || gameState.value.coins < 10,
    water: cell.type === 'empty' || gameState.value.coins < 5,
    fertilize: cell.type === 'empty' || (cell.fertilized === true) || gameState.value.coins < 15,
    harvest: cell.type !== 'ready'
  };
});

// Funções
function handleCellClick(index: number): void {
  if (store) {
    store.selectCell(index);
    selectedCell.value = store.selectedCell;
  }
}

function handleGameAction(action: GameAction): void {
  if (!store) return;
  
  const cellIndex = selectedCell.value;
  
  if (cellIndex === null && action !== 'satellite' && action !== 'reset') {
    store.addNotification('warning', 'Atenção', 'Selecione uma célula primeiro!');
    updateNotifications();
    return;
  }
  
  switch (action) {
    case 'plant':
      if (cellIndex !== null && cellIndex !== undefined) {
        store.plantSeed(cellIndex);
      }
      break;
      
    case 'water':
      if (cellIndex !== null && cellIndex !== undefined) {
        store.irrigateCell(cellIndex);
      }
      break;
      
    case 'fertilize':
      if (cellIndex !== null && cellIndex !== undefined) {
        store.fertilizeCell(cellIndex);
      }
      break;
      
    case 'harvest':
      if (cellIndex !== null && cellIndex !== undefined) {
        store.harvestCell(cellIndex);
      }
      break;
      
    case 'satellite':
      store.updateSatelliteData();
      break;
      
    case 'reset':
      store.resetGame();
      break;
  }
  
  updateStoreData();
}

function togglePause(): void {
  if (store) {
    store.togglePause();
    isPaused.value = store.isPaused;
    
    if (isPaused.value) {
      stopGameLoop();
    } else {
      startGameLoop();
    }
  }
}

function startGameLoop(): void {
  if (!isPaused.value && !gameLoop) {
    gameLoop = window.setInterval(() => {
      if (!isPaused.value && store) {
        store.advanceDay();
        updateStoreData();
      }
    }, 5000); // Avança um dia a cada 5 segundos
  }
}

function stopGameLoop(): void {
  if (gameLoop) {
    clearInterval(gameLoop);
    gameLoop = null;
  }
}

function updateStoreData(): void {
  if (!store) return;
  
  // Atualizar com verificações de segurança
  farmGrid.value = store.farmGrid ? [...store.farmGrid] : [];
  selectedCell.value = store.selectedCell ?? null;
  gameState.value = store.gameState ? { ...store.gameState } : gameState.value;
  satelliteData.value = store.satelliteData ? { ...store.satelliteData } : satelliteData.value;
  isPaused.value = store.isPaused ?? false;
  currentWeather.value = store.currentWeather ?? currentWeather.value;
  plantedCellsCount.value = store.plantedCellsCount ?? 0;
  readyToHarvestCount.value = store.readyToHarvestCount ?? 0;
  averageGrowth.value = store.averageGrowth ?? 0;
  updateNotifications();
}

function updateNotifications(): void {
  if (store && store.notifications) {
    notifications.value = [...store.notifications];
  }
}

// Lifecycle
onMounted(() => {
  console.log('🎮 App.vue montado!');
  
  // Iniciar jogo
  store.startGame();
  
  // Atualizar dados
  updateStoreData();
  
  // Iniciar game loop
  startGameLoop();
  
  // Marcar como carregado
  isLoading.value = false;
  
  // Esconder tutorial após 15 segundos
  setTimeout(() => {
    showTutorial.value = false;
  }, 15000);
  
  console.log('✅ NASA Farm Navigator pronto!');
});

onUnmounted(() => {
  console.log('👋 Limpando recursos...');
  stopGameLoop();
});
</script>

<style>
/* Loading */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: white;
  font-size: 1.5em;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Resto dos estilos */
.nasa-farm-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.app-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 2.5em;
  margin: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: 1em;
  filter: none;
  -webkit-text-fill-color: initial;
}

.app-subtitle {
  color: #718096;
  font-size: 1.1em;
  margin: 10px 0 0 0;
}

.tutorial {
  position: relative;
  max-width: 1400px;
  margin: 20px auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.5s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tutorial-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #718096;
  transition: color 0.3s ease;
}

.tutorial-close:hover {
  color: #4a5568;
}

.tutorial h3 {
  color: #4a5568;
  margin-bottom: 15px;
}

.tutorial ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 10px;
}

.tutorial li {
  color: #718096;
  padding: 10px;
  background: #f7fafc;
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

.tutorial li:hover {
  background: #edf2f7;
}

.tutorial strong {
  color: #4a5568;
}

.app-main {
  flex: 1;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.game-container {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
}

.game-board {
  min-height: 500px;
}

.game-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notifications {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
}

.notification {
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border-left: 4px solid;
}

.notification strong {
  display: block;
  margin-bottom: 5px;
  font-size: 1.05em;
}

.notification p {
  margin: 0;
  color: #718096;
  font-size: 0.95em;
}

.notification-success {
  border-left-color: #48bb78;
}

.notification-warning {
  border-left-color: #ed8936;
}

.notification-info {
  border-left-color: #4299e1;
}

.notification-error {
  border-left-color: #fc8181;
}

/* Animações das notificações */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Responsivo */
@media (max-width: 1024px) {
  .game-container {
    grid-template-columns: 1fr;
  }
  
  .game-sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .app-title {
    font-size: 1.8em;
  }
  
  .tutorial ul {
    grid-template-columns: 1fr;
  }
}
</style>