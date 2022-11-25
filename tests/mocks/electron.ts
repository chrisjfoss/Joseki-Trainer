/**
 * Importing this file mocks out electron imports
 *
 * IMPORTANT: This import needs to go above any electron imports that need
 *            to be mocked out, as it does not get hoisted
 */

import { beforeEach, vi } from 'vitest';
import { mockDeep, mockClear } from 'vitest-mock-extended';
import type { Dialog, BrowserWindow, IpcMain } from 'electron';
import type electron from 'electron';

const mBrowserWindow = mockDeep<typeof BrowserWindow>();
mBrowserWindow.getFocusedWindow.mockImplementation(
  () => mBrowserWindow.prototype
);

const mElectron = mockDeep<typeof electron>(
  { funcPropSupport: true },
  {
    app: {
      getAppPath: vi.fn(() => '')
    },
    BrowserWindow: mBrowserWindow,
    ipcMain: mockDeep<IpcMain>(),
    dialog: mockDeep<Dialog>()
  }
);

vi.doMock('electron', () => {
  console.log('Mocking electron');
  return {
    default: mElectron,
    ...mElectron
  };
});
beforeEach(() => {
  mockClear(mElectron);
});
