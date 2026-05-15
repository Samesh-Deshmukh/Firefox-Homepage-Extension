import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function copyToDist(files) {
  return {
    name: 'copy-extension-files',
    closeBundle() {
      for (const file of files) {
        if (fs.existsSync(file)) {
          fs.copyFileSync(file, path.join('dist', path.basename(file)));
        }
      }
      const publicDir = 'public';
      if (fs.existsSync(publicDir)) {
        for (const name of fs.readdirSync(publicDir)) {
          fs.copyFileSync(path.join(publicDir, name), path.join('dist', name));
        }
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), copyToDist(['manifest.json', 'background.js'])],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
