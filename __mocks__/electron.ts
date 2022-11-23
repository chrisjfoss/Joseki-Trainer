import { beforeEach, vi } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { BrowserWindow } from 'electron';

const initializeBrowserWindow = () => {
  const mockedBW = mockDeep<typeof BrowserWindow>();

  // mockedBW.getAllWindows.mockImplementation(() => [new mockedBW()]);
  mockedBW.prototype.loadURL.mockImplementation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_: string, __?: Electron.LoadURLOptions) => Promise.resolve()
  );

  return mockedBW;
};

export let app: Pick<Electron.App, 'getAppPath'>;
export let bw: DeepMockProxy<typeof BrowserWindow>;

beforeEach(() => {
  app = {
    getAppPath: vi.fn(() => '')
  };
  bw = initializeBrowserWindow();
});
