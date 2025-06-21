import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  takeScreenshot: () => ipcRenderer.invoke('take-screenshot'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  
  onScreenshotTrigger: (callback: () => void) => ipcRenderer.on('trigger-screenshot', callback),
  removeScreenshotTrigger: () => ipcRenderer.removeAllListeners('trigger-screenshot'),
  
  onDeleteLastScreenshotTrigger: (callback: () => void) => ipcRenderer.on('trigger-delete-last-screenshot', callback),
  removeDeleteLastScreenshotTrigger: () => ipcRenderer.removeAllListeners('trigger-delete-last-screenshot'),

  onProcessScreenshotsTrigger: (callback: () => void) => ipcRenderer.on('trigger-process-screenshots', callback),
  removeProcessScreenshotsTrigger: () => ipcRenderer.removeAllListeners('trigger-process-screenshots'),

  onStartNewProblemTrigger: (callback: () => void) => ipcRenderer.on('trigger-start-new-problem', callback),
  removeStartNewProblemTrigger: () => ipcRenderer.removeAllListeners('trigger-start-new-problem'),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electronAPI = api
}
