<template>
  <div class="control-panel">
    <h2 class="panel-title">🎮 Controles</h2>
    

    <div class="action-buttons">
      <button 
        class="action-btn btn-plant"
        @click="handleAction('plant')"
        :disabled="disabledActions.plant"
        :title="disabledActions.plant ? 'Selecione uma célula vazia e tenha 10 moedas' : 'Plantar semente'"
      >
        <span class="btn-icon">🌱</span>
        <span class="btn-text">Plantar</span>
        <span class="btn-cost">10 💰</span>
      </button>
      
      <button 
        class="action-btn btn-water"
        @click="handleAction('water')"
        :disabled="disabledActions.water"
        :title="disabledActions.water ? 'Selecione uma planta e tenha 5 moedas' : 'Irrigar cultura'"
      >
        <span class="btn-icon">💧</span>
        <span class="btn-text">Irrigar</span>
        <span class="btn-cost">5 💰</span>
      </button>
      
      <button 
        class="action-btn btn-fertilize"
        @click="handleAction('fertilize')"
        :disabled="disabledActions.fertilize"
        :title="disabledActions.fertilize ? 'Selecione uma planta não fertilizada e tenha 15 moedas' : 'Aplicar fertilizante'"
      >
        <span class="btn-icon">🌾</span>
        <span class="btn-text">Fertilizar</span>
        <span class="btn-cost">15 💰</span>
      </button>
      
      <button 
        class="action-btn btn-harvest"
        @click="handleAction('harvest')"
        :disabled="disabledActions.harvest"
        :title="disabledActions.harvest ? 'Selecione uma planta pronta para colheita' : 'Colher cultura'"
      >
        <span class="btn-icon">✨</span>
        <span class="btn-text">Colher</span>
        <span class="btn-reward">+30-50 💰</span>
      </button>
    </div>
    
 
    <div class="special-actions">
      <button 
        class="action-btn btn-satellite"
        @click="handleAction('satellite')"
        :disabled="satelliteCooldown > 0"
      >
        <span class="btn-icon">🛰️</span>
        <span class="btn-text">Análise Satelital</span>
        <span v-if="satelliteCooldown > 0" class="btn-cooldown">
          {{ satelliteCooldown }}s
        </span>
      </button>
      
      <button 
        class="action-btn btn-pause"
        @click="$emit('toggle-pause')"
      >
        <span class="btn-icon">{{ isPaused ? '▶️' : '⏸️' }}</span>
        <span class="btn-text">{{ isPaused ? 'Continuar' : 'Pausar' }}</span>
      </button>
    </div>
    

    <div class="system-actions">
      <button 
        class="action-btn btn-reset"
        @click="handleReset"
      >
        <span class="btn-icon">🔄</span>
        <span class="btn-text">Reiniciar Jogo</span>
      </button>
      
      <button 
        class="action-btn btn-help"
        @click="$emit('show-help')"
      >
        <span class="btn-icon">❓</span>
        <span class="btn-text">Ajuda</span>
      </button>
    </div>
    

    <div class="shortcuts">
      <h3>⌨️ Atalhos</h3>
      <div class="shortcut-list">
        <div class="shortcut">
          <kbd>P</kbd> Plantar
        </div>
        <div class="shortcut">
          <kbd>W</kbd> Irrigar
        </div>
        <div class="shortcut">
          <kbd>F</kbd> Fertilizar
        </div>
        <div class="shortcut">
          <kbd>H</kbd> Colher
        </div>
        <div class="shortcut">
          <kbd>S</kbd> Satélite
        </div>
        <div class="shortcut">
          <kbd>Space</kbd> Pausar
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { GameAction } from '@/types';


const props = defineProps<{
  disabledActions: {
    plant: boolean;
    water: boolean;
    fertilize: boolean;
    harvest: boolean;
  };
  isPaused: boolean;
}>();


const emit = defineEmits<{
  'action': [action: GameAction];
  'toggle-pause': [];
  'show-help': [];
}>();


const satelliteCooldown = ref(0);
let cooldownInterval: number | null = null;

function handleAction(action: GameAction): void {
  if (action === 'satellite' && satelliteCooldown.value === 0) {
   
    satelliteCooldown.value = 30;
    startCooldown();
  }
  
  emit('action', action);
}

function handleReset(): void {
  if (confirm('Tem certeza que deseja reiniciar o jogo? Todo o progresso será perdido.')) {
    emit('action', 'reset');
  }
}

function startCooldown(): void {
  if (cooldownInterval) {
    clearInterval(cooldownInterval);
  }
  
  cooldownInterval = window.setInterval(() => {
    if (satelliteCooldown.value > 0) {
      satelliteCooldown.value--;
    } else {
      if (cooldownInterval) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
      }
    }
  }, 1000);
}


function handleKeyPress(event: KeyboardEvent): void {

  if (event.target instanceof HTMLInputElement) return;
  
  switch (event.key.toLowerCase()) {
    case 'p':
      if (!props.disabledActions.plant) {
        handleAction('plant');
      }
      break;
    case 'w':
      if (!props.disabledActions.water) {
        handleAction('water');
      }
      break;
    case 'f':
      if (!props.disabledActions.fertilize) {
        handleAction('fertilize');
      }
      break;
    case 'h':
      if (!props.disabledActions.harvest) {
        handleAction('harvest');
      }
      break;
    case 's':
      if (satelliteCooldown.value === 0) {
        handleAction('satellite');
      }
      break;
    case ' ':
      event.preventDefault();
      emit('toggle-pause');
      break;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
  if (cooldownInterval) {
    clearInterval(cooldownInterval);
  }
});
</script>

<style scoped>
.control-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.panel-title {
  color: #4a5568;
  font-size: 1.3em;
  margin-bottom: 15px;
  text-align: center;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.special-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.system-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: left 0.3s ease;
}

.action-btn:hover:not(:disabled)::before {
  left: 100%;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.action-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1.8em;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.btn-text {
  font-size: 0.95em;
  font-weight: 600;
}

.btn-cost, .btn-reward {
  font-size: 0.85em;
  opacity: 0.9;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
}

.btn-cooldown {
  font-size: 0.85em;
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: 10px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}


.btn-plant {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.btn-water {
  background: linear-gradient(135deg, #4299e1, #3182ce);
}

.btn-fertilize {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.btn-harvest {
  background: linear-gradient(135deg, #f6e05e, #ecc94b);
}

.btn-satellite {
  background: linear-gradient(135deg, #9f7aea, #805ad5);
}

.btn-pause {
  background: linear-gradient(135deg, #718096, #4a5568);
}

.btn-reset {
  background: linear-gradient(135deg, #fc8181, #f56565);
}

.btn-help {
  background: linear-gradient(135deg, #4fd1c5, #38b2ac);
}

/* Atalhos */
.shortcuts {
  background: #f7fafc;
  border-radius: 12px;
  padding: 15px;
}

.shortcuts h3 {
  color: #4a5568;
  font-size: 1em;
  margin-bottom: 10px;
  text-align: center;
}

.shortcut-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.shortcut {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85em;
  color: #718096;
}

kbd {
  background: white;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 0.9em;
  box-shadow: 0 2px 0 #cbd5e0;
  color: #4a5568;
}
</style>