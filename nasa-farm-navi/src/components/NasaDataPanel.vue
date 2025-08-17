<template>
  <div class="nasa-data-panel">
    <h2 class="panel-title">🛰️ Dados NASA</h2>
    
    <!-- Display do clima -->
    <div class="weather-display">
      <div class="weather-icon">{{ weather.icon }}</div>
      <div class="weather-info">
        <h3>{{ weather.name }}</h3>
        <p>{{ weather.description }}</p>
      </div>
    </div>
    
    <!-- Dados do satélite -->
    <div class="satellite-data">
      <div class="data-grid">
        <div class="data-item temperature">
          <div class="data-icon">🌡️</div>
          <div class="data-content">
            <span class="data-label">Temperatura</span>
            <span class="data-value">{{ data.temperature }}°C</span>
          </div>
        </div>
        
        <div class="data-item humidity">
          <div class="data-icon">💧</div>
          <div class="data-content">
            <span class="data-label">Umidade</span>
            <span class="data-value">{{ data.humidity }}%</span>
          </div>
        </div>
        
        <div class="data-item uv">
          <div class="data-icon">☀️</div>
          <div class="data-content">
            <span class="data-label">Índice UV</span>
            <span class="data-value">{{ data.uvIndex }}</span>
          </div>
        </div>
        
        <div class="data-item soil">
          <div class="data-icon">🌱</div>
          <div class="data-content">
            <span class="data-label">Umidade do Solo</span>
            <span class="data-value">{{ data.soilMoisture }}%</span>
          </div>
        </div>
        
        <div class="data-item wind">
          <div class="data-icon">💨</div>
          <div class="data-content">
            <span class="data-label">Vento</span>
            <span class="data-value">{{ data.windSpeed }} km/h</span>
          </div>
        </div>
        
        <div class="data-item rain">
          <div class="data-icon">🌧️</div>
          <div class="data-content">
            <span class="data-label">Precipitação</span>
            <span class="data-value">{{ data.precipitation }} mm</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recomendações -->
    <div class="recommendations">
      <h3>💡 Recomendação NASA</h3>
      <p class="recommendation-text">{{ getRecommendation() }}</p>
      
      <!-- Alertas -->
      <div v-if="alerts.length > 0" class="alerts">
        <div 
          v-for="alert in alerts" 
          :key="alert"
          class="alert-item"
        >
          ⚠️ {{ alert }}
        </div>
      </div>
    </div>
    
    <!-- Última atualização -->
    <div class="last-update">
      <small>Última atualização: {{ formatTime(data.timestamp) }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SatelliteData, Weather } from '@/types';

// Props
const props = defineProps<{
  data: SatelliteData;
  weather: Weather;
}>();

// Computed - Alertas baseados nos dados
const alerts = computed(() => {
  const alertList: string[] = [];
  
  if (props.data.temperature > 35) {
    alertList.push('Temperatura muito alta - risco para as culturas');
  }
  if (props.data.humidity < 30) {
    alertList.push('Baixa umidade - irrigação necessária');
  }
  if (props.data.uvIndex > 9) {
    alertList.push('Índice UV extremo - proteja as plantas sensíveis');
  }
  if (props.data.soilMoisture < 20) {
    alertList.push('Solo muito seco - irrigue imediatamente');
  }
  if (props.weather.pestRisk > 0.6) {
    alertList.push('Alto risco de pragas - monitore as culturas');
  }
  
  return alertList;
});

// Funções
function getRecommendation(): string {
  const { humidity, temperature, soilMoisture } = props.data;
  const { name: weatherName, waterNeed } = props.weather;
  
  // Lógica de recomendação baseada nos dados
  if (soilMoisture < 20) {
    return "Solo extremamente seco! Irrigue todas as culturas imediatamente para evitar perdas.";
  }
  
  if (humidity < 30 && temperature > 30) {
    return "Condições de seca detectadas. Aumente a frequência de irrigação e considere aplicar cobertura morta.";
  }
  
  if (weatherName === 'Tempestade') {
    return "Tempestade detectada! Proteja culturas sensíveis e evite aplicar fertilizantes.";
  }
  
  if (weatherName === 'Chuvoso' && waterNeed < 1) {
    return "Chuva detectada. Economize água - irrigação natural ativa. Bom momento para plantar.";
  }
  
  if (temperature > 32) {
    return "Temperatura elevada. Irrigue no início da manhã ou final da tarde para reduzir evaporação.";
  }
  
  if (props.data.uvIndex > 8) {
    return "Radiação UV alta. Algumas culturas podem precisar de sombreamento parcial.";
  }
  
  if (soilMoisture > 70 && humidity > 80) {
    return "Alta umidade detectada. Monitore sinais de fungos e reduza irrigação.";
  }
  
  if (weatherName === 'Ensolarado' && soilMoisture > 40) {
    return "Condições ideais para crescimento! Aproveite para plantar novas culturas.";
  }
  
  return "Condições estáveis. Continue monitorando e mantenha práticas regulares de cultivo.";
}

function formatTime(timestamp?: Date): string {
  if (!timestamp) return 'Não disponível';
  
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Agora mesmo';
  if (minutes < 60) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
  
  return new Date(timestamp).toLocaleDateString('pt-BR');
}
</script>

<style scoped>
.nasa-data-panel {
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

.weather-display {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  margin-bottom: 20px;
  color: white;
}

.weather-icon {
  font-size: 3em;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.weather-info h3 {
  margin: 0;
  font-size: 1.2em;
}

.weather-info p {
  margin: 5px 0 0 0;
  opacity: 0.9;
  font-size: 0.9em;
}

.satellite-data {
  margin-bottom: 20px;
}

.data-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f7fafc;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.data-item:hover {
  background: #edf2f7;
  transform: translateY(-2px);
}

.data-icon {
  font-size: 1.5em;
}

.data-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.data-label {
  font-size: 0.8em;
  color: #718096;
  font-weight: 500;
}

.data-value {
  font-size: 1.1em;
  color: #4a5568;
  font-weight: bold;
}

/* Cores específicas para cada tipo de dado */
.data-item.temperature .data-value {
  color: #f56565;
}

.data-item.humidity .data-value {
  color: #4299e1;
}

.data-item.uv .data-value {
  color: #ed8936;
}

.data-item.soil .data-value {
  color: #48bb78;
}

.recommendations {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
}

.recommendations h3 {
  color: #22543d;
  font-size: 1em;
  margin-bottom: 10px;
}

.recommendation-text {
  color: #2f855a;
  font-size: 0.95em;
  line-height: 1.5;
  margin: 0;
}

.alerts {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.alert-item {
  background: #fff5f5;
  border-left: 3px solid #fc8181;
  padding: 8px 12px;
  border-radius: 5px;
  color: #c53030;
  font-size: 0.9em;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.last-update {
  text-align: center;
  color: #a0aec0;
  font-size: 0.85em;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
}
</style>