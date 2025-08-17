// src/types/game.types.ts

/**
 * Tipos relacionados ao jogo
 */

// Tipo de célula na fazenda
export type CellType = 'empty' | 'planted' | 'growing' | 'ready';

// Interface para cada célula do grid
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

// Estado geral do jogo
export interface GameState {
  coins: number;
  harvests: number;
  score: number;
  day: number;
  level: number;
  experience: number;
}

// Tipos de ação do jogador
export type GameAction = 
  | 'plant' 
  | 'water' 
  | 'fertilize' 
  | 'harvest' 
  | 'satellite' 
  | 'reset';

// Configurações do jogo
export interface GameConfig {
  gridSize: number;
  dayDuration: number; // em milissegundos
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

// Notificação do sistema
export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  duration?: number;
}