import electron from "electron";
import path from "path";
import fs from "fs";

const dialog = electron.dialog;

export const saveBufferToFile = (buffer: ArrayBuffer, defaultName: string) => {
  const window = electron.BrowserWindow.getFocusedWindow();
  if (!window) return;
  dialog
    .showSaveDialog({
      title: "Save File",
      defaultPath: path.join(__dirname, `gjt-${defaultName}.db`),
      buttonLabel: "Save",
      // Restricting the user to only db files
      filters: [
        {
          name: "Database Files",
          extensions: ["db"]
        }
      ],
      properties: ["showOverwriteConfirmation"]
    })
    .then(async (file) => {
      if (file.canceled) return;
      fs.writeFile(file.filePath!.toString(), Buffer.from(buffer), (err) => {
        if (err) throw err;
      });
    });
};
