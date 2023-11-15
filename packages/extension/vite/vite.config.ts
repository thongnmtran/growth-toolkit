import { defineConfig } from 'vite';
import { resolve } from 'path';
import solidPlugin from 'vite-plugin-solid';
import suidPlugin from '@suid/vite-plugin';
import solidSvgPlugin from 'vite-plugin-solid-svg';
// import webExtension from '@samrum/vite-plugin-web-extension';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';

function generateManifest() {
  const manifest = readJsonFile('src/manifest.json');
  return {
    ...manifest,
  };
}

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
    solidSvgPlugin(),
    webExtension({
      manifest: generateManifest,
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
    sourcemap: true,
    // sourcemap: 'inline',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
    },
  },
});
