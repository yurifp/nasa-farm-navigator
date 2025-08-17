/// <reference types="vite/client" />

// Declaração para arquivos .vue
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Declaração para Pinia
declare module 'pinia' {
  export * from 'pinia/dist/pinia'
}