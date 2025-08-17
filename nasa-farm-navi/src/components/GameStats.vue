<template>
  <div class="game-stats">
    <h2 class="stats-title">📊 Estatísticas</h2>
    
    <!-- Estatísticas principais -->
    <div class="stats-grid">
      <div class="stat-card coins">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <span class="stat-label">Moedas</span>
          <span class="stat-value">{{ stats.coins }}</span>
        </div>
      </div>
      
      <div class="stat-card score">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <span class="stat-label">Pontuação</span>
          <span class="stat-value">{{ formatNumber(stats.score) }}</span>
        </div>
      </div>
    </div>
    
    <!-- Informações detalhadas -->
    <div class="detail-stats">
      <div class="stat-item">
        <span class="stat-label">🌾 Colheitas:</span>
        <span class="stat-value">{{ stats.harvests }}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">📅 Dia:</span>
        <span class="stat-value">{{ stats.day }}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">🎮 Nível:</span>
        <span class="stat-value">{{ stats.level }}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">✨ Experiência:</span>
        <span class="stat-value">{{ stats.experience }}/{{ experienceNeeded }}</span>
      </div>
    </div>
    
    <!-- Barra de progresso do nível -->
    <div class="level-progress">
      <div class="progress-label">
        <span>Progresso do Nível</span>
        <span>{{ Math.round(levelProgress) }}%</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${levelProgress}%` }"
        ></div>
      </div>
    </div>
    
    <!-- Estatísticas da fazenda -->
    <div class="farm-stats">
      <h3>🌱 Status da Fazenda</h3>
      <div class="stat-item">
        <span class="stat-label">Plantas Ativas:</span>
        <span class="stat-value">{{ plantedCells }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Prontas p/ Colheita:</span>
        <span class="stat-value highlight">{{ readyToHarvest }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Crescimento Médio:</span>
        <span class="stat-value">{{ averageGrowth }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GameState } from '@/types';

// Props
const props = defineProps<{
  stats: GameState;
  plantedCells: number;
  readyToHarvest: number;
  averageGrowth: number;
}>();

// Computed
const experienceNeeded = computed(() => props.stats.level * 100);

const levelProgress = computed(() => {
  return (props.stats.experience / experienceNeeded.value) * 100;
});

// Funções auxiliares
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
</script>

<style scoped>
.game-stats {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.stats-title {
  color: #4a5568;
  font-size: 1.3em;
  margin-bottom: 15px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.coins {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.stat-card.score {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon {
  font-size: 1.8em;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.stat-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stat-info .stat-label {
  font-size: 0.85em;
  opacity: 0.9;
  font-weight: 500;
}

.stat-info .stat-value {
  font-size: 1.4em;
  font-weight: bold;
}

.detail-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f7fafc;
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

.stat-item:hover {
  background: #edf2f7;
}

.stat-label {
  color: #718096;
  font-weight: 600;
  font-size: 0.95em;
}

.stat-value {
  color: #4a5568;
  font-weight: bold;
  font-size: 1em;
}

.stat-value.highlight {
  color: #38a169;
  font-size: 1.1em;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.level-progress {
  margin-bottom: 20px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.9em;
  color: #718096;
}

.progress-bar {
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.farm-stats {
  border-top: 1px solid #e2e8f0;
  padding-top: 15px;
}

.farm-stats h3 {
  color: #4a5568;
  font-size: 1.1em;
  margin-bottom: 10px;
  text-align: center;
}
</style>