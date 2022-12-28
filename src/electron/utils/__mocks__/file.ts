import { beforeEach, vi } from 'vitest';

export const openDbFiles = vi.fn();
export const saveBufferToFile = vi.fn();

beforeEach(() => {
  openDbFiles.mockClear();
  saveBufferToFile.mockClear();
});
