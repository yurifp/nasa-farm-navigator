// src/stores/gameStore.ts
import { defineStore } from 'pinia';
import type { Cell, GameState, Weather, SatelliteData, Notification } from '@/types';

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
const WEATHER_TYPES: Weather[] = [
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

interface StoreState {
  farmGrid: Cell[];
  selectedCell: number | null;
  gameState: GameState;
  currentWeatherIndex: number;
  satelliteData: SatelliteData;
  notifications: Notification[];
  config: typeof DEFAULT_CONFIG;
  isPlaying: boolean;
  isPaused: boolean;
}

export const useGameStore = defineStore('game', {
  state: (): StoreState => ({
    farmGrid: [],
    selectedCell: null,
    gameState: {
      coins: DEFAULT_CONFIG.initialCoins,
      harvests: 0,
      score: 0,
      day: 1,
      level: 1,
      experience: 0
    },
    currentWeatherIndex: 0,
    satelliteData: {
      temperature: 25,
      humidity: 60,
      uvIndex: 6,
      soilMoisture: 50,
      precipitation: 0,
      windSpeed: 10
    },
    notifications: [],
    config: DEFAULT_CONFIG,
    isPlaying: false,
    isPaused: false
  }),

  getters: {
    currentWeather: (state): Weather => {
      return WEATHER_TYPES[state.currentWeatherIndex];
    },

    plantedCellsCount: (state): number => {
      return state.farmGrid.filter(cell => cell.type !== 'empty').length;
    },

    readyToHarvestCount: (state): number => {
      return state.farmGrid.filter(cell => cell.type === 'ready').length;
    },

    averageGrowth: (state): number => {
      const plantedCells = state.farmGrid.filter(cell => cell.type !== 'empty');
      if (plantedCells.length === 0) return 0;
      
      const totalGrowth = plantedCells.reduce((sum, cell) => sum + cell.growth, 0);
      return Math.round(totalGrowth / plantedCells.length);
    },

    averageHealth: (state): number => {
      const plantedCells = state.farmGrid.filter(cell => cell.type !== 'empty');
      if (plantedCells.length === 0) return 100;
      
      const totalHealth = plantedCells.reduce((sum, cell) => sum + cell.health, 0);
      return Math.round(totalHealth / plantedCells.length);
    },

    experienceToNextLevel: (state): number => {
      return state.gameState.level * 100;
    },

    levelProgress(): number {
      const needed = this.experienceToNextLevel;
      return (this.gameState.experience / needed) * 100;
    }
  },

  actions: {
    initializeGrid(size = DEFAULT_CONFIG.gridSize) {
      this.farmGrid = Array(size).fill(null).map((_, index) => ({
        id: index,
        type: 'empty' as const,
        growth: 0,
        irrigated: false,
        fertilized: false,
        health: 100
      }));
    },

    selectCell(index: number) {
      if (index >= 0 && index < this.farmGrid.length) {
        this.selectedCell = index;
      }
    },

    plantSeed(cellIndex: number): boolean {
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

    irrigateCell(cellIndex: number): boolean {
      const cell = this.farmGrid[cellIndex];
      
      if (!cell || cell.type === 'empty' || this.gameState.coins < this.config.costs.water) {
        return false;
      }

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

    fertilizeCell(cellIndex: number): boolean {
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

    harvestCell(cellIndex: number): number {
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
      
      if (this.gameState.experience >= this.experienceToNextLevel) {
        this.levelUp();
      }
      
      Object.assign(cell, {
        type: 'empty' as const,
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

    updateCellGrowthStage(cellIndex: number) {
      const cell = this.farmGrid[cellIndex];
      if (!cell) return;
      
      if (cell.growth >= 100) {
        cell.type = 'ready';
        cell.growth = 100;
      } else if (cell.growth >= 50) {
        cell.type = 'growing';
      }
    },

    growCrops() {
      const weather = this.currentWeather;
      
      this.farmGrid.forEach(cell => {
        if (cell.type === 'planted' || cell.type === 'growing') {
          const baseGrowth = 5;
          const weatherBonus = baseGrowth * weather.growthModifier;
          const irrigationBonus = cell.irrigated ? 3 : -2;
          const fertilizerBonus = cell.fertilized ? 5 : 0;
          const healthModifier = cell.health / 100;
          
          const totalGrowth = Math.floor(
            (weatherBonus + irrigationBonus + fertilizerBonus) * healthModifier
          );
          
          cell.growth = Math.min(100, cell.growth + totalGrowth);
          
          if (cell.irrigated && Math.random() > 0.5) {
            cell.irrigated = false;
          }
          
          if (weather.pestRisk > Math.random()) {
            cell.health = Math.max(0, cell.health - 10);
          }
          
          this.updateCellGrowthStage(cell.id);
        }
      });
    },

    advanceDay() {
      this.gameState.day++;
      this.growCrops();
      
      if (this.gameState.day % 3 === 0) {
        this.changeWeather();
      }
      
      if (this.gameState.day % 5 === 0) {
        this.updateSatelliteData();
      }
    },

    changeWeather() {
      this.currentWeatherIndex = (this.currentWeatherIndex + 1) % WEATHER_TYPES.length;
      const weather = this.currentWeather;
      
      this.addNotification(
        'warning', 
        'Mudança Climática', 
        `Clima mudou para ${weather.name} ${weather.icon}`
      );
    },

    updateSatelliteData() {
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

    levelUp() {
      this.gameState.level++;
      this.gameState.experience = 0;
      
      const bonus = this.gameState.level * 50;
      this.gameState.coins += bonus;
      
      this.addNotification(
        'success',
        'Level Up!',
        `Parabéns! Você alcançou o nível ${this.gameState.level}! Ganhou ${bonus} moedas! 🎊`
      );
    },

    addNotification(
      type: 'success' | 'warning' | 'info' | 'error',
      title: string,
      message: string
    ) {
      const notification: Notification = {
        id: Date.now().toString(),
        type,
        title,
        message,
        duration: 3000
      };
      
      this.notifications.push(notification);
      
      setTimeout(() => {
        const index = this.notifications.findIndex(n => n.id === notification.id);
        if (index > -1) {
          this.notifications.splice(index, 1);
        }
      }, notification.duration || 3000);
    },

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

    startGame() {
      this.isPlaying = true;
      this.isPaused = false;
      this.initializeGrid();
      this.updateSatelliteData();
    },

    togglePause() {
      this.isPaused = !this.isPaused;
    }
  }
});