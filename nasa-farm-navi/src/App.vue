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
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import type { GameAction } from '@/types';

import FarmGrid from '@/components/FarmGrid.vue';
import GameStats from '@/components/GameStats.vue';
import NasaDataPanel from '@/components/NasaDataPanel.vue';
import ControlPanel from '@/components/ControlPanel.vue';

const store = useGameStore();

// Estado local
const showTutorial = ref(true);
const isLoading = ref(true);
let gameLoop: number | null = null;

// Computed - ações desabilitadas
const disabledActions = computed(() => {
  const cellIndex = store.selectedCell;
  
  if (cellIndex === null || !store.farmGrid[cellIndex]) {
    return {
      plant: true,
      water: true,
      fertilize: true,
      harvest: true
    };
  }
  
  const cell = store.farmGrid[cellIndex];
  
  return {
    plant: cell.type !== 'empty' || store.gameState.coins < 10,
    water: cell.type === 'empty' || store.gameState.coins < 5,
    fertilize: cell.type === 'empty' || cell.fertilized || store.gameState.coins < 15,
    harvest: cell.type !== 'ready'
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
      if (cellIndex !== null) store.plantSeed(cellIndex);
      break;
    case 'water':
      if (cellIndex !== null) store.irrigateCell(cellIndex);
      break;
    case 'fertilize':
      if (cellIndex !== null) store.fertilizeCell(cellIndex);
      break;
    case 'harvest':
      if (cellIndex !== null) store.harvestCell(cellIndex);
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
  isLoading.value = false;
  
  setTimeout(() => {
    showTutorial.value = false;
  }, 15000);
});

onUnmounted(() => {
  stopGameLoop();
});
</script>

<!-- Estilos permanecem os mesmos -->