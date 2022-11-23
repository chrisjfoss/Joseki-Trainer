import { FileUtil } from '.';
import { BrowserWindow, ipcMain } from 'electron';
import { EVENTS } from '../../common/events';

export const nodeImportDatabase = async () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    const files = await FileUtil.openDbFiles();
    win.webContents.send(EVENTS.importDb, files);
  }
};

export const nodeExportDatase = async (name?: string) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.webContents.send(EVENTS.exportDb, [name]);
    ipcMain.once(
      EVENTS.exportDbComplete,
      (
        event: Electron.Event,
        { buffer, name }: { buffer: ArrayBuffer; name: string }
      ) => {
        FileUtil.saveBufferToFile(buffer, name);
      }
    );
  }
};
