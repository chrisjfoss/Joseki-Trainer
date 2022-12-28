// / <reference types="vitest" />
import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config';
import path from 'path';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      setupFiles: ['./tests/setup/index.ts'],
      coverage: {
        exclude: ['**/__mocks__', 'tests']
      }
    },
    resolve: {
      alias: {
        '@tests': path.resolve(__dirname, './tests'),
        '@electron': path.resolve(__dirname, './src/electron'),
        '@common': path.resolve(__dirname, './src/common'),
        '@': path.resolve(__dirname, './src/renderer')
      }
    }
  })
);
