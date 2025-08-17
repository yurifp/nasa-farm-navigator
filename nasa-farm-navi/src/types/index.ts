// src/types/index.ts

// ===== TIPOS DO JOGO =====
export type CellType = 'empty' | 'planted' | 'growing' | 'ready';

export interface Cell {
  id: number;
  type: CellType;
  growth: number;
  irrigated: boolean;
  fertilized: boolean;
  health: number;
  plantedAt?: Date;
  lastWateredAt?: Date;
}

export interface GameState {
  coins: number;
  harvests: number;
  score: number;
  day: number;
  level: number;
  experience: number;
}

export type GameAction = 
  | 'plant' 
  | 'water' 
  | 'fertilize' 
  | 'harvest' 
  | 'satellite' 
  | 'reset';

export interface GameConfig {
  gridSize: number;
  dayDuration: number;
  initialCoins: number;
  costs: {
    plant: number;
    water: number;
    fertilize: number;
  };
  rewards: {
    harvest: number;
    harvestWithFertilizer: number;
    experience: number;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  duration?: number;
}

// ===== TIPOS NASA =====
export interface SatelliteData {
  temperature: number;
  humidity: number;
  uvIndex: number;
  soilMoisture: number;
  precipitation: number;
  windSpeed: number;
  timestamp?: Date;
}

export interface Weather {
  id: number;
  name: string;
  icon: string;
  description: string;
  growthModifier: number;
  waterNeed: number;
  pestRisk: number;
}

export interface SatelliteImagery {
  url: string;
  date: string;
  cloudCoverage: number;
  resolution: number;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface CropAnalysis {
  healthIndex: number;
  growthStage: string;
  stressIndicators: string[];
  recommendations: string[];
  ndviValue: number;
  estimatedYield: number;
}

export interface HistoricalData {
  date: Date;
  temperature: number;
  humidity: number;
  rainfall: number;
  cropYield?: number;
}

export interface WeatherForecast {
  date: Date;
  conditions: Weather;
  temperatureMin: number;
  temperatureMax: number;
  precipitationChance: number;
}