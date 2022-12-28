import { rmSync } from 'fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-electron-plugin';
import { alias, customStart, loadViteEnv } from 'vite-electron-plugin/plugin';
import pkg from './package.json';
import path from 'path';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

rmSync('dist-electron', { recursive: true, force: true });

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, 'src/common'),
      '@': path.resolve(__dirname, 'src/renderer')
    }
  },
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    electron({
      root: 'src',
      include: ['electron', 'common'],
      outDir: '../dist-electron',
      transformOptions: {
        sourcemap: !!process.env.VSCODE_DEBUG
      },
      plugins: [
        ...(process.env.VSCODE_DEBUG
          ? [
              // Will start Electron via VSCode Debug
              customStart(() =>
                debounce(() =>
                  console.log(
                    /* For `.vscode/.debug.script.mjs` */ '[startup] Electron App'
                  )
                )
              )
            ]
          : []),
        // Allow use `import.meta.env.VITE_SOME_KEY` in Electron-Main
        loadViteEnv(),
        alias([
          {
            find: '@electron',
            replacement: path.join(__dirname, 'src/electron/')
          },
          { find: '@common', replacement: path.join(__dirname, 'src/common/') },
          { find: '@', replacement: path.join(__dirname, 'src/renderer/') }
        ])
      ]
    }),
    quasar()
  ],
  server: process.env.VSCODE_DEBUG
    ? (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
        return {
          host: url.hostname,
          port: +url.port
        };
      })()
    : undefined,
  clearScreen: false,
  build: {
    assetsDir: '' // #287
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/scss/main.scss";`
      }
    }
  }
});

function debounce<Fn extends (...args: any[]) => void>(fn: Fn, delay = 299) {
  let t: NodeJS.Timeout;
  return ((...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  }) as Fn;
}
