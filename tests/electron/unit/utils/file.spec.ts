// Vitest
import { describe, expect, it, vi } from 'vitest';

// Mocked Imports
import electron from 'electron';
import fs from 'fs';

// Under Test
import { FileUtil } from '@electron/utils';
import { anyFunction } from 'vitest-mock-extended';

// Setup Imports
vi.mock('electron');
vi.mock('fs');

// Mock Declarations
const mBrowserWindow = vi.mocked(electron.BrowserWindow);
const mDialog = vi.mocked(electron.dialog);
const mReadFileSync = vi.mocked(fs.readFileSync);
const mWriteFile = vi.mocked(fs.writeFile);

describe.concurrent('electron -> utils -> file', () => {
  describe('openDbFiles', () => {
    it('should open the file dialog', async () => {
      // Arrange
      mDialog.showOpenDialog.mockResolvedValueOnce({
        canceled: true,
        filePaths: []
      });

      // Act
      await FileUtil.openDbFiles();

      // Assert
      expect(mDialog.showOpenDialog).toHaveBeenCalledOnce();
    });
    it('should not open the file dialog if there is no focused window', async () => {
      // Arrange
      mBrowserWindow.getFocusedWindow.mockReturnValueOnce(null);

      // Act
      await FileUtil.openDbFiles();

      // Assert
      expect(mDialog.showOpenDialog).not.toHaveBeenCalled();
    });
    it('should return an empty array if the user canceled opening files', async () => {
      // Arrange
      mDialog.showOpenDialog.mockResolvedValueOnce({
        canceled: true,
        filePaths: []
      });

      // Act
      const files = await FileUtil.openDbFiles();

      // Assert
      expect(files).toStrictEqual([]);
    });
    it('should return an empty array if the user canceled opening files', async () => {
      // Arrange
      mDialog.showOpenDialog.mockResolvedValueOnce({
        canceled: true,
        filePaths: []
      });

      // Act
      const files = await FileUtil.openDbFiles();

      // Assert
      expect(files).toStrictEqual([]);
    });
    it('should return the files the user selects', async () => {
      // Arrange
      const EXPECTED_FILE_NAME = 'exampleFile.db';
      mDialog.showOpenDialog.mockResolvedValueOnce({
        canceled: false,
        filePaths: [
          `c:\\users\\example\\${EXPECTED_FILE_NAME}`,
          'c:\\users\\example\\exampleFile2.db'
        ]
      });

      // Act
      const files = await FileUtil.openDbFiles();

      // Assert
      expect(files).toHaveLength(2);
      expect(files![0].fileName).toBe(EXPECTED_FILE_NAME);
      expect(mReadFileSync).toHaveBeenCalledTimes(2);
    });
  });
  describe('saveBufferToFile', () => {
    it('should open the save file dialog', () => {
      // Arrange
      const DEFAULT_NAME = 'test.db';
      mDialog.showSaveDialog.mockResolvedValueOnce({
        canceled: true,
        filePath: ''
      });
      // Act
      FileUtil.saveBufferToFile(new ArrayBuffer(1), DEFAULT_NAME);

      // Assert
      expect(mDialog.showSaveDialog).toHaveBeenCalledOnce();
      expect(mDialog.showSaveDialog).toHaveBeenCalledWith(
        mBrowserWindow.getFocusedWindow(),
        expect.objectContaining({
          title: 'Save File',
          buttonLabel: 'Save',
          filters: expect.arrayContaining([
            expect.objectContaining({ extensions: ['db'] })
          ]),
          defaultPath: expect.stringContaining(DEFAULT_NAME)
        })
      );
    });
    it('should not open the save file dialog if there is no focused window', () => {
      // Arrange
      mBrowserWindow.getFocusedWindow.mockReturnValueOnce(null);

      // Act
      FileUtil.saveBufferToFile(new ArrayBuffer(1), '');

      // Assert
      expect(mDialog.showSaveDialog).not.toHaveBeenCalled();
    });
    it('should save the file', async () => {
      // Arrange
      const DEFAULT_NAME = 'test.db';
      const FILE_PATH = `c:\\example\\path\\${DEFAULT_NAME}`;
      const BUFFER = new ArrayBuffer(1);
      mDialog.showSaveDialog.mockResolvedValueOnce({
        canceled: false,
        filePath: FILE_PATH
      });

      // Act
      await FileUtil.saveBufferToFile(BUFFER, DEFAULT_NAME);

      // Assert
      expect(mWriteFile).toHaveBeenCalledOnce();
      expect(mWriteFile).toHaveBeenCalledWith(
        FILE_PATH,
        Buffer.from(BUFFER),
        anyFunction()
      );
    });
    it('should not save the file if the user canceled the operation', async () => {
      // Arrange
      const DEFAULT_NAME = 'test.db';
      const FILE_PATH = `c:\\example\\path\\${DEFAULT_NAME}`;
      const BUFFER = new ArrayBuffer(1);
      mDialog.showSaveDialog.mockResolvedValueOnce({
        canceled: true,
        filePath: FILE_PATH
      });

      // Act
      await FileUtil.saveBufferToFile(BUFFER, DEFAULT_NAME);

      // Assert
      expect(mWriteFile).not.toHaveBeenCalledOnce();
    });
    it('should throw an error if the save fails', async () => {
      // Arrange
      const DEFAULT_NAME = 'test.db';
      const FILE_PATH = `c:\\example\\path\\${DEFAULT_NAME}`;
      const BUFFER = new ArrayBuffer(1);
      mDialog.showSaveDialog.mockResolvedValueOnce({
        canceled: false,
        filePath: FILE_PATH
      });
      let methodUnderTest: Parameters<typeof fs.writeFile>[2] = () => {};
      mWriteFile.mockImplementationOnce(
        (
          filePath: Parameters<typeof fs.writeFile>[0],
          buffer: Parameters<typeof fs.writeFile>[1],
          handler: Parameters<typeof fs.writeFile>[2]
        ) => {
          methodUnderTest = handler;
        }
      );
      const toThrow = () => methodUnderTest(new Error());

      // Act
      await FileUtil.saveBufferToFile(BUFFER, DEFAULT_NAME);

      // Assert
      expect(toThrow).toThrowError();
    });
  });
});
