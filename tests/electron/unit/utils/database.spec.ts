// Vitest
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Setup Imports
vi.mock('electron');
vi.mock('@electron/utils/file');

// Mocked Imports
import { openDbFiles, saveBufferToFile } from '@electron/utils/file';
import { BrowserWindow, ipcMain, type IpcMainEvent } from 'electron';

// Under Test
import { DatabaseUtil } from '@electron/utils';
import { EVENTS } from '@common/events';
import { anyFunction, mock } from 'vitest-mock-extended';

// Mock Declarations
const mGetFocusedBrowserWindow = vi.mocked(BrowserWindow.getFocusedWindow);
const mIpcMain = vi.mocked(ipcMain);
const mSend = vi.mocked(BrowserWindow.prototype.webContents.send);
const mOpenDbFiles = vi.mocked(openDbFiles);
const mSaveBufferToFile = vi.mocked(saveBufferToFile);

describe.concurrent('electron -> utils -> database', () => {
  beforeEach(() => {
    mOpenDbFiles.mockReset();
    mSaveBufferToFile.mockReset();
  });
  describe('nodeImportDatabase', () => {
    it('should send the files to the client webpage', async () => {
      // Arrange
      const EXPECTED_FILES = [
        {
          fileName: 'Test File',
          buffer: new ArrayBuffer(1) as Buffer
        },
        {
          fileName: 'Test File 2',
          buffer: new ArrayBuffer(1) as Buffer
        }
      ];
      mOpenDbFiles.mockResolvedValueOnce(EXPECTED_FILES);

      // Act
      await DatabaseUtil.nodeImportDatabase();

      // Assert
      expect(mSend).toHaveBeenCalledOnce();
      expect(mSend).toHaveBeenCalledWith(EVENTS.importDb, EXPECTED_FILES);
    });
    it('should not send the files if there is no focusedWindow', async () => {
      // Arrange
      mGetFocusedBrowserWindow.mockReturnValueOnce(null);

      // Act
      await DatabaseUtil.nodeImportDatabase();

      // Assert
      expect(mGetFocusedBrowserWindow).toHaveBeenCalledTimes(1);
      expect(mSend).not.toHaveBeenCalled();
    });
  });
  describe('nodeExportDatabase', () => {
    it('should send the database name to the client webpage', async () => {
      // Arrange
      const EXPECTED_NAME = 'Default Database';

      // Act
      await DatabaseUtil.nodeExportDatabase(EXPECTED_NAME);

      // Assert
      expect(mSend).toHaveBeenCalledOnce();
      expect(mSend).toHaveBeenCalledWith(EVENTS.exportDb, [EXPECTED_NAME]);
    });
    it('should not send the database name if there is no focusedWindow', async () => {
      // Arrange
      mGetFocusedBrowserWindow.mockReturnValueOnce(null);

      // Act
      await DatabaseUtil.nodeExportDatabase();

      // Assert
      expect(mGetFocusedBrowserWindow).toHaveBeenCalledTimes(1);
      expect(mSend).not.toHaveBeenCalled();
    });
    it('should add a listener for the export db complete event', async () => {
      // Act
      await DatabaseUtil.nodeExportDatabase();

      // Assert
      expect(mIpcMain.once).toHaveBeenCalledOnce();
      expect(mIpcMain.once).toHaveBeenCalledWith(
        EVENTS.exportDbComplete,
        anyFunction()
      );
    });
    it('should not add a listener if there is no focusedWindow', async () => {
      // Arrange
      mGetFocusedBrowserWindow.mockReturnValueOnce(null);

      // Act
      await DatabaseUtil.nodeExportDatabase();

      // Assert
      expect(mIpcMain.once).not.toHaveBeenCalled();
    });
    it('should save the buffer to a file when the listener is triggered', async () => {
      // Arrange
      const EXPECTED_BUFFER = new ArrayBuffer(1);
      const EXPECTED_NAME = 'database_backup';

      let methodUnderTest: (
        event: IpcMainEvent,
        args: Record<string, any>
      ) => void = () => {};

      // When the listener gets called, we will grab out the passed in function
      mIpcMain.once.mockImplementationOnce(
        (eventName: string, handler: typeof methodUnderTest) => {
          methodUnderTest = handler;
          return mIpcMain;
        }
      );

      // Act
      await DatabaseUtil.nodeExportDatabase();
      methodUnderTest(mock<IpcMainEvent>(), {
        buffer: EXPECTED_BUFFER,
        name: EXPECTED_NAME
      });

      // Assert
      expect(mSaveBufferToFile).toHaveBeenCalledOnce();
      expect(mSaveBufferToFile).toHaveBeenCalledWith(
        EXPECTED_BUFFER,
        EXPECTED_NAME
      );
    });
  });
});
