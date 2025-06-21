import { app, BrowserWindow, ipcMain, screen, desktopCapturer, globalShortcut } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

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
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Remove menu bar
  win.setMenuBarVisibility(false)

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // Register global shortcuts
  globalShortcut.register('CommandOrControl+H', () => {
    win?.webContents.send('trigger-screenshot')
  })

  globalShortcut.register('CommandOrControl+B', () => {
    if (win) {
      win.isVisible() ? win.hide() : win.show()
    }
  })

  const moveDistance = 20
  globalShortcut.register('CommandOrControl+Up', () => {
    if (win) {
      const [x, y] = win.getPosition()
      win.setPosition(x, y - moveDistance)
    }
  })
  globalShortcut.register('CommandOrControl+Down', () => {
    if (win) {
      const [x, y] = win.getPosition()
      win.setPosition(x, y + moveDistance)
    }
  })
  globalShortcut.register('CommandOrControl+Left', () => {
    if (win) {
      const [x, y] = win.getPosition()
      win.setPosition(x - moveDistance, y)
    }
  })
  globalShortcut.register('CommandOrControl+Right', () => {
    if (win) {
      const [x, y] = win.getPosition()
      win.setPosition(x + moveDistance, y)
    }
  })

  globalShortcut.register('CommandOrControl+L', () => {
    win?.webContents.send('trigger-delete-last-screenshot')
  })

  globalShortcut.register('CommandOrControl+Enter', () => {
    win?.webContents.send('trigger-process-screenshots')
  })

  globalShortcut.register('CommandOrControl+R', () => {
    win?.webContents.send('trigger-start-new-problem')
  })

  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit()
  })
}

// IPC Handlers
ipcMain.handle('take-screenshot', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: 1920, height: 1080 }
  })

  const primarySource = sources[0]
  if (primarySource) {
    return {
      dataURL: primarySource.thumbnail.toDataURL()
    }
  }
  return null
})

ipcMain.handle('minimize-window', () => {
  win?.minimize()
})

ipcMain.handle('close-window', () => {
  win?.hide()
})

ipcMain.handle('toggle-always-on-top', () => {
  if (win) {
    const currentState = win.isAlwaysOnTop()
    win.setAlwaysOnTop(!currentState)
    return !currentState
  }
  return false
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.whenReady().then(createWindow)
