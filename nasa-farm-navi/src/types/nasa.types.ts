// src/types/nasa.types.ts

/**
 * Tipos relacionados aos dados da NASA
 */

// Dados do satélite
export interface SatelliteData {
  temperature: number;
  humidity: number;
  uvIndex: number;
  soilMoisture: number;
  precipitation: number;
  windSpeed: number;
  timestamp?: Date;
}

// Condições climáticas
export interface Weather {
  id: number;
  name: string;
  icon: string;
  description: string;
  growthModifier: number;
  waterNeed: number;
  pestRisk: number;
}

// Imagem de satélite
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

// Análise de culturas via NDVI
export interface CropAnalysis {
  healthIndex: number; // 0-100
  growthStage: string;
  stressIndicators: string[];
  recommendations: string[];
  ndviValue: number; // -1 to 1
  estimatedYield: number;
}

// Dados históricos
export interface HistoricalData {
  date: Date;
  temperature: number;
  humidity: number;
  rainfall: number;
  cropYield?: number;
}

// Previsão do tempo
export interface WeatherForecast {
  date: Date;
  conditions: Weather;
  temperatureMin: number;
  temperatureMax: number;
  precipitationChance: number;
}