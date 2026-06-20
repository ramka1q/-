// Electron-обгортка: відкриває гру у власному вікні (без браузера).
const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#0a0414',
    autoHideMenuBar: true,
    title: 'НІКІТА: Пожирач планети',
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'web', 'nikita-game.html'));

  // F11 — повноекранний режим, Esc — вийти з нього
  globalShortcut.register('F11', () => win.setFullScreen(!win.isFullScreen()));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('will-quit', () => globalShortcut.unregisterAll());
