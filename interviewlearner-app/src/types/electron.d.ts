export interface ElectronAPI {
  takeScreenshot: () => Promise<{ dataURL: string } | null>
  minimizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  toggleAlwaysOnTop: () => Promise<boolean>
  onScreenshotTrigger: (callback: () => void) => void
  removeScreenshotTrigger: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
} 