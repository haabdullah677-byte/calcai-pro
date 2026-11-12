import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^\.\.?\/components\/(.*)/, replacement: path.resolve(__dirname, '$1') },
      { find: /^\.\.?\/utils\/(.*)/, replacement: path.resolve(__dirname, '$1') },
      { find: /^\.\.?\/services\/(.*)/, replacement: path.resolve(__dirname, '$1') },
      { find: /^\.\.?\/types/, replacement: path.resolve(__dirname, 'types') },
      { find: /^@\/(.*)/, replacement: path.resolve(__dirname, '$1') },
    ],
  },
});
