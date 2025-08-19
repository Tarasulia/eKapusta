/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// PWA типи
declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    immediate?: boolean
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: any) => void
    onOfflineReady?: () => void
    onNeedRefresh?: () => void
  }): void
}

declare module 'virtual:pwa-register/react' {
  export function useRegisterSW(options?: {
    immediate?: boolean
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: any) => void
  }): {
    offlineReady: [boolean, (value: boolean) => void]
    needRefresh: [boolean, (value: boolean) => void]
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }
}