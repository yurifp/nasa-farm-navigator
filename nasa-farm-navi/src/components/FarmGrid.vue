<template>
  <div class="farm-grid">
    <h2 class="grid-title">🌾 Sua Fazenda</h2>
    
    <div class="grid-container">
      <div
        v-for="(cell, index) in cells"
        :key="`cell-${index}`"
        :class="[
          'grid-cell',
          getCellClass(cell),
          { 'selected': selectedCell === index }
        ]"
        @click="$emit('cell-click', index)"
      >
        <!-- Ícone da planta -->
        <span class="cell-icon">{{ getCellIcon(cell) }}</span>
        
        <!-- Indicador de crescimento -->
        <div v-if="cell.growth > 0" class="growth-indicator">
          {{ cell.growth }}%
        </div>
        
        <!-- Indicadores de status -->
        <div class="status-indicators">
          <span v-if="cell.irrigated" class="status-icon water">💧</span>
          <span v-if="cell.fertilized" class="status-icon fertilizer">✨</span>
        </div>
        
        <!-- Barra de saúde -->
        <div v-if="cell.type !== 'empty'" class="health-bar">
          <div 
            class="health-fill" 
            :style="{ width: `${cell.health}%` }"
            :class="getHealthClass(cell.health)"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Legenda -->
    <div class="grid-legend">
      <div class="legend-item">
        <span class="legend-icon">🟫</span>
        <span>Vazio</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon">🌱</span>
        <span>Plantado</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon">🌿</span>
        <span>Crescendo</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon">🌾</span>
        <span>Pronto</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Cell } from '@/types';

// Props
const props = defineProps<{
  cells: Cell[];
  selectedCell: number | null;
}>();

// Emits
const emit = defineEmits<{
  'cell-click': [index: number];
}>();

// Funções auxiliares
function getCellClass(cell: Cell): string {
  if (cell.type === 'ready') return 'ready';
  if (cell.fertilized) return 'fertilized';
  if (cell.irrigated) return 'irrigated';
  if (cell.type === 'planted' || cell.type === 'growing') return 'planted';
  return 'empty';
}

function getCellIcon(cell: Cell): string {
  switch (cell.type) {
    case 'planted':
      return '🌱';
    case 'growing':
      return '🌿';
    case 'ready':
      return '🌾';
    default:
      return '🟫';
  }
}

function getHealthClass(health: number): string {
  if (health >= 70) return 'health-good';
  if (health >= 40) return 'health-medium';
  return 'health-low';
}
</script>

<style scoped>
.farm-grid {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.grid-title {
  color: #4a5568;
  font-size: 1.5em;
  margin-bottom: 20px;
  text-align: center;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

/* Responsivo */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

.grid-cell {
  aspect-ratio: 1;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  min-height: 60px;
}

.grid-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.grid-cell.selected {
  border-color: #9f7aea;
  border-width: 3px;
  box-shadow: 0 0 20px rgba(159, 122, 234, 0.4);
}

/* Classes de estado */
.grid-cell.empty {
  background: linear-gradient(135deg, #8B6914 0%, #CD9B1D 100%);
}

.grid-cell.planted {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.grid-cell.irrigated {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.grid-cell.fertilized {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

.grid-cell.ready {
  background: linear-gradient(135deg, #f6e05e 0%, #ecc94b 100%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 0 0 0 rgba(246, 224, 94, 0.7);
  }
  50% { 
    transform: scale(1.02); 
    box-shadow: 0 0 20px 5px rgba(246, 224, 94, 0.3);
  }
}

.cell-icon {
  font-size: 2em;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.growth-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.7em;
  font-weight: bold;
  z-index: 3;
}

.status-indicators {
  position: absolute;
  top: 4px;
  left: 4px;
  display: flex;
  gap: 2px;
  z-index: 3;
}

.status-icon {
  font-size: 0.8em;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.health-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.health-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.health-good {
  background: #48bb78;
}

.health-medium {
  background: #ed8936;
}

.health-low {
  background: #fc8181;
}

.grid-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 10px;
  background: #f7fafc;
  border-radius: 10px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9em;
  color: #4a5568;
}

.legend-icon {
  font-size: 1.2em;
}
</style>