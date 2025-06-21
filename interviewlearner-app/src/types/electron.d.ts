export interface ElectronAPI {
  takeScreenshot: () => Promise<{ dataURL: string } | null>
  minimizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  toggleAlwaysOnTop: () => Promise<boolean>
  onScreenshotTrigger: (callback: () => void) => void
  removeScreenshotTrigger: () => void
  onDeleteLastScreenshotTrigger: (callback: () => void) => void
  removeDeleteLastScreenshotTrigger: () => void
  onProcessScreenshotsTrigger: (callback: () => void) => void
  removeProcessScreenshotsTrigger: () => void
  onStartNewProblemTrigger: (callback: () => void) => void
  removeStartNewProblemTrigger: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
} 