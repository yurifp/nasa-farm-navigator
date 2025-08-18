// src/types/index.ts
export interface Cell {
  id: number
  type: 'empty' | 'planted' | 'growing' | 'ready'
  growth: number
  irrigated: boolean
  fertilized: boolean
  health: number
  plantedAt?: Date
  lastWateredAt?: Date
}

export interface GameState {
  coins: number
  harvests: number
  score: number
  day: number
  level: number
  experience: number
}

export interface Weather {
  id: number
  name: string
  icon: string
  description: string
  growthModifier: number
  waterNeed: number
  pestRisk: number
}

export interface SatelliteData {
  temperature: number
  humidity: number
  uvIndex: number
  soilMoisture: number
  precipitation: number
  windSpeed: number
  timestamp?: Date
}

export interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  duration?: number
}
