import { ipcMain, desktopCapturer, app, BrowserWindow, globalShortcut, screen } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: 400,
    height: 600,
    x: width - 420,
    y: 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.setMenuBarVisibility(false);
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  globalShortcut.register("CommandOrControl+H", () => {
    win == null ? void 0 : win.webContents.send("trigger-screenshot");
  });
  globalShortcut.register("CommandOrControl+B", () => {
    if (win) {
      win.isVisible() ? win.hide() : win.show();
    }
  });
  const moveDistance = 20;
  globalShortcut.register("CommandOrControl+Up", () => {
    if (win) {
      const [x, y] = win.getPosition();
      win.setPosition(x, y - moveDistance);
    }
  });
  globalShortcut.register("CommandOrControl+Down", () => {
    if (win) {
      const [x, y] = win.getPosition();
      win.setPosition(x, y + moveDistance);
    }
  });
  globalShortcut.register("CommandOrControl+Left", () => {
    if (win) {
      const [x, y] = win.getPosition();
      win.setPosition(x - moveDistance, y);
    }
  });
  globalShortcut.register("CommandOrControl+Right", () => {
    if (win) {
      const [x, y] = win.getPosition();
      win.setPosition(x + moveDistance, y);
    }
  });
  globalShortcut.register("CommandOrControl+L", () => {
    win == null ? void 0 : win.webContents.send("trigger-delete-last-screenshot");
  });
  globalShortcut.register("CommandOrControl+Enter", () => {
    win == null ? void 0 : win.webContents.send("trigger-process-screenshots");
  });
  globalShortcut.register("CommandOrControl+R", () => {
    win == null ? void 0 : win.webContents.send("trigger-start-new-problem");
  });
  globalShortcut.register("CommandOrControl+Q", () => {
    app.quit();
  });
}
ipcMain.handle("take-screenshot", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: 1920, height: 1080 }
  });
  const primarySource = sources[0];
  if (primarySource) {
    return {
      dataURL: primarySource.thumbnail.toDataURL()
    };
  }
  return null;
});
ipcMain.handle("minimize-window", () => {
  win == null ? void 0 : win.minimize();
});
ipcMain.handle("close-window", () => {
  win == null ? void 0 : win.hide();
});
ipcMain.handle("toggle-always-on-top", () => {
  if (win) {
    const currentState = win.isAlwaysOnTop();
    win.setAlwaysOnTop(!currentState);
    return !currentState;
  }
  return false;
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
