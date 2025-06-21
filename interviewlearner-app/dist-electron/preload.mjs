"use strict";
const electron = require("electron");
const api = {
  takeScreenshot: () => electron.ipcRenderer.invoke("take-screenshot"),
  minimizeWindow: () => electron.ipcRenderer.invoke("minimize-window"),
  closeWindow: () => electron.ipcRenderer.invoke("close-window"),
  toggleAlwaysOnTop: () => electron.ipcRenderer.invoke("toggle-always-on-top"),
  onScreenshotTrigger: (callback) => {
    electron.ipcRenderer.on("trigger-screenshot", callback);
  },
  removeScreenshotTrigger: () => {
    electron.ipcRenderer.removeAllListeners("trigger-screenshot");
  }
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
