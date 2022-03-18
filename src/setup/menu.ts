import { app, BrowserWindow, ipcMain, Menu } from "electron";
import { saveBufferToFile } from "./helpers/saveFile";
// import { saveBlobToFile } from "./helpers/saveFile";

const isMac = process.platform === "darwin";

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" }
          ]
        }
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: "File",
    submenu: [
      {
        label: "Export Current Database",
        click: async () => {
          const win = BrowserWindow.getFocusedWindow();
          if (win) {
            win.webContents.send("export-db");
            ipcMain.on(
              "export-db-complete",
              (
                event: Electron.Event,
                { buffer, name }: { buffer: ArrayBuffer; name: string }
              ) => {
                saveBufferToFile(buffer, name);
              }
            );
          }
        }
      },
      { role: isMac ? "close" : "quit" }
    ]
  },
  // { role: 'viewMenu' }
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      ...(isMac
        ? [
            { type: "separator" },
            { role: "front" },
            { type: "separator" },
            { role: "window" }
          ]
        : [{ role: "close" }])
    ]
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://electronjs.org");
        }
      }
    ]
  }
] as (Electron.MenuItemConstructorOptions | Electron.MenuItem)[];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
