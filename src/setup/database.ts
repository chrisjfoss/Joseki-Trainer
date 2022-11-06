import { FileUtil } from "@/background/utils";
import { BrowserWindow, ipcMain } from "electron";

export const nodeImportDatabase = async () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    const files = await FileUtil.openDbFiles();
    win.webContents.send("import-db", files);
  }
};

export const nodeExportDatase = async (name?: string) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.webContents.send("export-db", name);
    ipcMain.once(
      "export-db-complete",
      (
        event: Electron.Event,
        { buffer, name }: { buffer: ArrayBuffer; name: string }
      ) => {
        FileUtil.saveBufferToFile(buffer, name);
      }
    );
  }
};
