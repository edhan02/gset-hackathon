/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    css: {
      postcss: {
        plugins: [
          tailwindcss({
            config: path.resolve(__dirname, 'tailwind.config.js'),
          }),
          autoprefixer(),
        ],
      },
    },
    server: {
      proxy: {
        '/api/analyze': {
          target: env.VITE_N8N_WEBHOOK_URL || 'https://bugbusters7.app.n8n.cloud/webhook/shield-analyze',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/analyze/, ''),
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
    },
  };
});
