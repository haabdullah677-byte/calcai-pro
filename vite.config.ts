import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^\.\.?\/(components|utils|services|types)(\/.*)?$/,
        replacement: '$2',
        customResolver(source, importer) {
          if (importer && importer.includes('node_modules')) {
            return null;
          }
          const cleanName = source.replace(/^\//, '');
          return this.resolve(path.resolve(__dirname, cleanName), importer, { skipSelf: true });
        },
      },
      { find: /^@\/(.*)/, replacement: path.resolve(__dirname, '$1') },
    ],
  },
});
