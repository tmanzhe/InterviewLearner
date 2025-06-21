"use strict";
const electron = require("electron");
const api = {
  takeScreenshot: () => electron.ipcRenderer.invoke("take-screenshot"),
  minimizeWindow: () => electron.ipcRenderer.invoke("minimize-window"),
  closeWindow: () => electron.ipcRenderer.invoke("close-window"),
  toggleAlwaysOnTop: () => electron.ipcRenderer.invoke("toggle-always-on-top"),
  onScreenshotTrigger: (callback) => electron.ipcRenderer.on("trigger-screenshot", callback),
  removeScreenshotTrigger: () => electron.ipcRenderer.removeAllListeners("trigger-screenshot"),
  onDeleteLastScreenshotTrigger: (callback) => electron.ipcRenderer.on("trigger-delete-last-screenshot", callback),
  removeDeleteLastScreenshotTrigger: () => electron.ipcRenderer.removeAllListeners("trigger-delete-last-screenshot"),
  onProcessScreenshotsTrigger: (callback) => electron.ipcRenderer.on("trigger-process-screenshots", callback),
  removeProcessScreenshotsTrigger: () => electron.ipcRenderer.removeAllListeners("trigger-process-screenshots"),
  onStartNewProblemTrigger: (callback) => electron.ipcRenderer.on("trigger-start-new-problem", callback),
  removeStartNewProblemTrigger: () => electron.ipcRenderer.removeAllListeners("trigger-start-new-problem")
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electronAPI", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electronAPI = api;
}
