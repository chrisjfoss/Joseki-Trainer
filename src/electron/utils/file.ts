import electron from 'electron';
import path from 'path';
import fs from 'fs';

export const openDbFiles = async () => {
  const dialog = electron.dialog;
  const window = electron.BrowserWindow.getFocusedWindow();
  if (!window) return;
  return await dialog
    .showOpenDialog({
      title: 'Import Database',
      buttonLabel: 'Import',
      // Restricting the user to only db files
      filters: [
        {
          name: 'Database',
          extensions: ['db']
        }
      ],
      properties: ['openFile', 'multiSelections']
    })
    .then((files) => {
      if (!files.canceled) {
        const fileData: { fileName: string; buffer: Buffer }[] = [];
        files.filePaths.forEach((filePath) => {
          const fileName = path.basename(filePath);
          const buffer = fs.readFileSync(filePath);
          fileData.push({ fileName, buffer });
        });
        return fileData;
      }
      return [];
    });
};

export const saveBufferToFile = async (
  buffer: ArrayBuffer,
  defaultName: string
) => {
  const dialog = electron.dialog;
  const window = electron.BrowserWindow.getFocusedWindow();
  if (!window) return;
  return dialog
    .showSaveDialog(window, {
      title: 'Save File',
      defaultPath: path.join(__dirname, `${defaultName}.db`),
      buttonLabel: 'Save',
      // Restricting the user to only db files
      filters: [
        {
          name: 'Database Files',
          extensions: ['db']
        }
      ],
      properties: ['showOverwriteConfirmation']
    })
    .then(async (file) => {
      if (file.canceled) return;
      return fs.writeFile(
        file.filePath!.toString(),
        Buffer.from(buffer),
        (err) => {
          if (err) throw err;
        }
      );
    });
};
