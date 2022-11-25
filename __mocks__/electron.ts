import { beforeEach, vi } from 'vitest';
import { mockDeep, mockClear } from 'vitest-mock-extended';
import type { BrowserWindow as eBrowserWindow } from 'electron';
import type electron from 'electron';

const mBrowserWindow = mockDeep<typeof eBrowserWindow>();
mBrowserWindow.getFocusedWindow.mockImplementation(
  () => mBrowserWindow.prototype
);

const mElectron = mockDeep<typeof electron>(
  { funcPropSupport: true },
  {
    app: {
      getAppPath: vi.fn(() => '')
    },
    BrowserWindow: mBrowserWindow
  }
);

export default mElectron;
export const BrowserWindow = mBrowserWindow;
export const ipcMain = mElectron.ipcMain;
export const dialog = mElectron.dialog;

beforeEach(() => {
  mockClear(mElectron);
});
