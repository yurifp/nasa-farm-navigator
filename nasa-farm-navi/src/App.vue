<template>
  <div id="app" class="nasa-farm-app">
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
            :cells="store.farmGrid"
            :selected-cell="store.selectedCell"
            @cell-click="handleCellClick"
          />
        </div>

        <!-- Sidebar -->
        <aside class="game-sidebar">
          <GameStats
            :stats="store.gameState"
            :planted-cells="store.plantedCellsCount"
            :ready-to-harvest="store.readyToHarvestCount"
            :average-growth="store.averageGrowth"
          />
          
          <NasaDataPanel
            :data="store.satelliteData"
            :weather="store.currentWeather"
          />
          
          <ControlPanel
            :disabled-actions="disabledActions"
            :is-paused="store.isPaused"
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
        v-for="notification in store.notifications"
        :key="notification.id"
        :class="['notification', `notification-${notification.type}`]"
      >
        <strong>{{ notification.title }}</strong>
        <p>{{ notification.message }}</p>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import type { GameAction } from '@/types';

// Componentes
import FarmGrid from '@/components/FarmGrid.vue';
import GameStats from '@/components/GameStats.vue';
import NasaDataPanel from '@/components/NasaDataPanel.vue';
import ControlPanel from '@/components/ControlPanel.vue';

// Store - usar diretamente
const store = useGameStore();

// Estado local
const showTutorial = ref(true);
let gameLoop: number | null = null;

// Computed - ações desabilitadas
const disabledActions = computed(() => {
  const cellIndex = store.selectedCell;
  const cell = cellIndex !== null && cellIndex >= 0 && cellIndex < store.farmGrid.length 
    ? store.farmGrid[cellIndex] 
    : null;
  
  return {
    plant: !cell || cell.type !== 'empty' || store.gameState.coins < 10,
    water: !cell || cell.type === 'empty' || store.gameState.coins < 5,
    fertilize: !cell || cell.type === 'empty' || cell.fertilized || store.gameState.coins < 15,
    harvest: !cell || cell.type !== 'ready'
  };
});

// Funções
function handleCellClick(index: number): void {
  store.selectCell(index);
}

function handleGameAction(action: GameAction): void {
  const cellIndex = store.selectedCell;
  
  if (cellIndex === null && action !== 'satellite' && action !== 'reset') {
    store.addNotification('warning', 'Atenção', 'Selecione uma célula primeiro!');
    return;
  }
  
  switch (action) {
    case 'plant':
      if (cellIndex !== null) {
        store.plantSeed(cellIndex);
      }
      break;
      
    case 'water':
      if (cellIndex !== null) {
        store.irrigateCell(cellIndex);
      }
      break;
      
    case 'fertilize':
      if (cellIndex !== null) {
        store.fertilizeCell(cellIndex);
      }
      break;
      
    case 'harvest':
      if (cellIndex !== null) {
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
}

function togglePause(): void {
  store.togglePause();
  
  if (store.isPaused) {
    stopGameLoop();
  } else {
    startGameLoop();
  }
}

function startGameLoop(): void {
  if (!store.isPaused && !gameLoop) {
    gameLoop = window.setInterval(() => {
      if (!store.isPaused) {
        store.advanceDay();
      }
    }, 5000);
  }
}

function stopGameLoop(): void {
  if (gameLoop) {
    clearInterval(gameLoop);
    gameLoop = null;
  }
}

// Lifecycle
onMounted(() => {
  store.startGame();
  startGameLoop();
  
  setTimeout(() => {
    showTutorial.value = false;
  }, 15000);
});

onUnmounted(() => {
  stopGameLoop();
});
</script>

<style>
/* Importar estilos globais */
@import '@/assets/styles/main.css';
</style>

<style scoped>
.nasa-farm-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
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

/* Tutorial */
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

/* Main */
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

.game-board {
  min-height: 500px;
}

.game-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Notificações */
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
</style>