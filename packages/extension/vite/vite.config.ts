import { defineConfig } from 'vite';
import { resolve } from 'path';
import { mkdirSync } from 'fs';
import solidPlugin from 'vite-plugin-solid';
import suidPlugin from '@suid/vite-plugin';
// import solidSvgPlugin from 'vite-plugin-solid-svg';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

function generateManifest() {
  const manifest = readJsonFile('src/manifest.json');
  return {
    ...manifest,
  };
}

const root = resolve(__dirname, '..');
const profileDir = resolve(root, 'profiles', 'default', 'Default');
mkdirSync(profileDir, { recursive: true });

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4444',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    suidPlugin(),
    solidPlugin({
      typescript: {
        isTSX: true,
        allExtensions: true,
      },
      hot: true,
      dev: true,
    }),
    // solidSvgPlugin(),
    webExtension({
      manifest: generateManifest,
      browser: 'none',
      // webExtConfig: {
      //   // args: ['--user-data-dir=' + profileDir],
      //   chromiumProfile: profileDir,
      //   chromeBinary: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      //   startUrl: ['https://chat.openai.com/'],
      // },
      additionalInputs: ['src/@popup/popup.tsx', 'src/@popup/popup.html'],
    }),
    nodePolyfills({
      include: ['buffer', 'stream'],
    }),
  ],
  publicDir: './public',
  build: {
    target: 'esnext',
    copyPublicDir: true,
    emptyOutDir: true,
    rollupOptions: {
      treeshake: 'recommended',
      // input: {
      //   app: './public/index.html',
      // },
      output: {
        dir: './dist',
        // entryFileNames: 'entry/[name].js',
      },
    },
    // sourcemap: 'inline',
  },
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
      '@components': resolve(root, 'src/components'),
    },
  },
});
