// @ts-nocheck
// src/stores/gameStore.ts

import { defineStore } from 'pinia';

// Configurações padrão do jogo
const DEFAULT_CONFIG = {
  gridSize: 48,
  dayDuration: 5000,
  initialCoins: 100,
  costs: {
    plant: 10,
    water: 5,
    fertilize: 15
  },
  rewards: {
    harvest: 30,
    harvestWithFertilizer: 50,
    experience: 10
  }
};

// Tipos de clima disponíveis
const WEATHER_TYPES = [
  {
    id: 1,
    name: 'Ensolarado',
    icon: '☀️',
    description: 'Perfeito para crescimento',
    growthModifier: 1.2,
    waterNeed: 1.5,
    pestRisk: 0.2
  },
  {
    id: 2,
    name: 'Nublado',
    icon: '☁️',
    description: 'Crescimento moderado',
    growthModifier: 1.0,
    waterNeed: 1.0,
    pestRisk: 0.3
  },
  {
    id: 3,
    name: 'Chuvoso',
    icon: '🌧️',
    description: 'Irrigação natural',
    growthModifier: 0.8,
    waterNeed: 0.5,
    pestRisk: 0.5
  },
  {
    id: 4,
    name: 'Tempestade',
    icon: '⛈️',
    description: 'Risco para culturas',
    growthModifier: 0.5,
    waterNeed: 0.3,
    pestRisk: 0.7
  },
  {
    id: 5,
    name: 'Parcialmente Nublado',
    icon: '⛅',
    description: 'Condições boas',
    growthModifier: 1.1,
    waterNeed: 1.2,
    pestRisk: 0.25
  }
];

export const useGameStore = defineStore('game', {
  // Estado
  state: () => ({
    // Grid da fazenda
    farmGrid: [],
    selectedCell: null,
    
    // Estado do jogo
    gameState: {
      coins: DEFAULT_CONFIG.initialCoins,
      harvests: 0,
      score: 0,
      day: 1,
      level: 1,
      experience: 0
    },
    
    // Clima e dados NASA
    currentWeatherIndex: 0,
    satelliteData: {
      temperature: 25,
      humidity: 60,
      uvIndex: 6,
      soilMoisture: 50,
      precipitation: 0,
      windSpeed: 10
    },
    
    // Sistema de notificações
    notifications: [],
    
    // Configurações
    config: DEFAULT_CONFIG,
    
    // Estado do jogo
    isPlaying: false,
    isPaused: false
  }),

  // Getters (computed properties)
  getters: {
    // Clima atual
    currentWeather: (state) => {
      return WEATHER_TYPES[state.currentWeatherIndex];
    },

    // Total de células plantadas
    plantedCellsCount: (state) => {
      return state.farmGrid.filter(cell => cell.type !== 'empty').length;
    },

    // Células prontas para colheita
    readyToHarvestCount: (state) => {
      return state.farmGrid.filter(cell => cell.type === 'ready').length;
    },

    // Crescimento médio das culturas
    averageGrowth: (state) => {
      const plantedCells = state.farmGrid.filter(cell => cell.type !== 'empty');
      if (plantedCells.length === 0) return 0;
      
      const totalGrowth = plantedCells.reduce((sum, cell) => sum + cell.growth, 0);
      return Math.round(totalGrowth / plantedCells.length);
    },

    // Saúde média das culturas
    averageHealth: (state) => {
      const plantedCells = state.farmGrid.filter(cell => cell.type !== 'empty');
      if (plantedCells.length === 0) return 100;
      
      const totalHealth = plantedCells.reduce((sum, cell) => sum + cell.health, 0);
      return Math.round(totalHealth / plantedCells.length);
    },

    // Experiência necessária para próximo nível
    experienceToNextLevel: (state) => {
      return state.gameState.level * 100;
    },

    // Porcentagem de progresso do nível
    levelProgress: (state) => {
      const needed = state.gameState.level * 100;
      return (state.gameState.experience / needed) * 100;
    }
  },

  // Ações
  actions: {
    // Inicializar o grid
    initializeGrid(size = DEFAULT_CONFIG.gridSize) {
      console.log('🎮 Inicializando grid com', size, 'células...');
      this.farmGrid = Array(size).fill(null).map((_, index) => ({
        id: index,
        type: 'empty',
        growth: 0,
        irrigated: false,
        fertilized: false,
        health: 100
      }));
      console.log('✅ Grid criado:', this.farmGrid.length, 'células');
    },

    // Selecionar célula
    selectCell(index) {
      if (index >= 0 && index < this.farmGrid.length) {
        this.selectedCell = index;
      }
    },

    // Plantar semente
    plantSeed(cellIndex) {
      const cell = this.farmGrid[cellIndex];
      
      if (!cell || cell.type !== 'empty' || this.gameState.coins < this.config.costs.plant) {
        return false;
      }

      cell.type = 'planted';
      cell.growth = 10;
      cell.plantedAt = new Date();
      this.gameState.coins -= this.config.costs.plant;
      
      this.addNotification('success', 'Plantado!', 'Semente plantada com sucesso! 🌱');
      return true;
    },

    // Irrigar célula
    irrigateCell(cellIndex) {
      const cell = this.farmGrid[cellIndex];
      
      if (!cell || cell.type === 'empty' || this.gameState.coins < this.config.costs.water) {
        return false;
      }

      // Bônus se não estava irrigado
      if (!cell.irrigated) {
        cell.growth = Math.min(100, cell.growth + 15);
        cell.irrigated = true;
      } else {
        cell.growth = Math.min(100, cell.growth + 5);
      }
      
      cell.lastWateredAt = new Date();
      cell.health = Math.min(100, cell.health + 10);
      this.gameState.coins -= this.config.costs.water;
      
      this.updateCellGrowthStage(cellIndex);
      this.addNotification('success', 'Irrigado!', 'Cultura irrigada! 💧');
      
      return true;
    },

    // Fertilizar célula
    fertilizeCell(cellIndex) {
      const cell = this.farmGrid[cellIndex];
      
      if (!cell || cell.type === 'empty' || cell.fertilized || 
          this.gameState.coins < this.config.costs.fertilize) {
        return false;
      }

      cell.fertilized = true;
      cell.growth = Math.min(100, cell.growth + 25);
      cell.health = Math.min(100, cell.health + 20);
      this.gameState.coins -= this.config.costs.fertilize;
      
      this.updateCellGrowthStage(cellIndex);
      this.addNotification('success', 'Fertilizado!', 'Fertilizante aplicado! 🌾');
      
      return true;
    },

    // Colher
    harvestCell(cellIndex) {
      const cell = this.farmGrid[cellIndex];
      
      if (!cell || cell.type !== 'ready') {
        return 0;
      }

      const earnings = cell.fertilized 
        ? this.config.rewards.harvestWithFertilizer 
        : this.config.rewards.harvest;
      
      const points = cell.fertilized ? 150 : 100;
      
      this.gameState.coins += earnings;
      this.gameState.score += points;
      this.gameState.harvests++;
      this.gameState.experience += this.config.rewards.experience;
      
      // Verificar level up
      if (this.gameState.experience >= this.experienceToNextLevel) {
        this.levelUp();
      }
      
      // Reset da célula
      Object.assign(cell, {
        type: 'empty',
        growth: 0,
        irrigated: false,
        fertilized: false,
        health: 100,
        plantedAt: undefined,
        lastWateredAt: undefined
      });
      
      this.addNotification(
        'success', 
        'Colheita!', 
        `Ganhou ${earnings} moedas e ${points} pontos! 🎉`
      );
      
      return earnings;
    },

    // Atualizar estágio de crescimento
    updateCellGrowthStage(cellIndex) {
      const cell = this.farmGrid[cellIndex];
      if (!cell) return;
      
      if (cell.growth >= 100) {
        cell.type = 'ready';
        cell.growth = 100;
      } else if (cell.growth >= 50) {
        cell.type = 'growing';
      }
    },

    // Crescer culturas (chamado a cada dia)
    growCrops() {
      const weather = this.currentWeather;
      
      this.farmGrid.forEach(cell => {
        if (cell.type === 'planted' || cell.type === 'growing') {
          // Cálculo de crescimento
          const baseGrowth = 5;
          const weatherBonus = baseGrowth * weather.growthModifier;
          const irrigationBonus = cell.irrigated ? 3 : -2;
          const fertilizerBonus = cell.fertilized ? 5 : 0;
          const healthModifier = cell.health / 100;
          
          const totalGrowth = Math.floor(
            (weatherBonus + irrigationBonus + fertilizerBonus) * healthModifier
          );
          
          cell.growth = Math.min(100, cell.growth + totalGrowth);
          
          // Degradação da irrigação
          if (cell.irrigated && Math.random() > 0.5) {
            cell.irrigated = false;
          }
          
          // Degradação da saúde baseada no clima
          if (weather.pestRisk > Math.random()) {
            cell.health = Math.max(0, cell.health - 10);
          }
          
          this.updateCellGrowthStage(cell.id);
        }
      });
    },

    // Avançar dia
    advanceDay() {
      this.gameState.day++;
      this.growCrops();
      
      // Mudar clima a cada 3 dias
      if (this.gameState.day % 3 === 0) {
        this.changeWeather();
      }
      
      // Atualizar dados do satélite a cada 5 dias
      if (this.gameState.day % 5 === 0) {
        this.updateSatelliteData();
      }
    },

    // Mudar clima
    changeWeather() {
      this.currentWeatherIndex = (this.currentWeatherIndex + 1) % WEATHER_TYPES.length;
      const weather = this.currentWeather;
      
      this.addNotification(
        'warning', 
        'Mudança Climática', 
        `Clima mudou para ${weather.name} ${weather.icon}`
      );
    },

    // Atualizar dados do satélite
    updateSatelliteData() {
      // Simular variação baseada no clima
      const weather = this.currentWeather;
      
      this.satelliteData = {
        temperature: Math.floor(20 + Math.random() * 15 - weather.waterNeed * 2),
        humidity: Math.floor(40 + Math.random() * 40 * weather.waterNeed),
        uvIndex: Math.floor(3 + Math.random() * 8 / weather.growthModifier),
        soilMoisture: Math.floor(20 + Math.random() * 60 * weather.waterNeed),
        precipitation: weather.waterNeed > 1 ? 0 : Math.floor(Math.random() * 50),
        windSpeed: Math.floor(5 + Math.random() * 20),
        timestamp: new Date()
      };
      
      this.addNotification('info', 'Dados NASA', 'Dados do satélite atualizados! 🛰️');
    },

    // Subir de nível
    levelUp() {
      this.gameState.level++;
      this.gameState.experience = 0;
      
      // Bônus por level up
      const bonus = this.gameState.level * 50;
      this.gameState.coins += bonus;
      
      this.addNotification(
        'success',
        'Level Up!',
        `Parabéns! Você alcançou o nível ${this.gameState.level}! Ganhou ${bonus} moedas! 🎊`
      );
    },

    // Adicionar notificação
    addNotification(type, title, message) {
      const notification = {
        id: Date.now().toString(),
        type,
        title,
        message,
        duration: 3000
      };
      
      this.notifications.push(notification);
      
      // Remover após duração
      setTimeout(() => {
        const index = this.notifications.findIndex(n => n.id === notification.id);
        if (index > -1) {
          this.notifications.splice(index, 1);
        }
      }, notification.duration || 3000);
    },

    // Resetar jogo
    resetGame() {
      this.initializeGrid();
      this.selectedCell = null;
      this.gameState = {
        coins: this.config.initialCoins,
        harvests: 0,
        score: 0,
        day: 1,
        level: 1,
        experience: 0
      };
      this.currentWeatherIndex = 0;
      this.notifications = [];
      this.updateSatelliteData();
      
      this.addNotification('info', 'Jogo Reiniciado', 'Boa sorte na nova fazenda! 🚀');
    },

    // Iniciar jogo
    startGame() {
      console.log('🎮 Iniciando jogo...');
      this.isPlaying = true;
      this.isPaused = false;
      this.initializeGrid();
      this.updateSatelliteData();
      console.log('✅ Jogo iniciado!');
    },

    // Pausar jogo
    togglePause() {
      this.isPaused = !this.isPaused;
    }
  }
});