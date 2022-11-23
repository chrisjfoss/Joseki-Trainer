// Vitest
import { describe, it, vi } from 'vitest';

// Under Test
import { DatabaseUtil } from '@electron/utils';

vi.mock('electron');

describe('electron -> utils -> database', () => {
  describe('nodeImportDatabase', () => {
    it('should get the focusedWindow', async () => {
      // Act
      await DatabaseUtil.nodeImportDatabase();

      // Assert
    });
  });
});
