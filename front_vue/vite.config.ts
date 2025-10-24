import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue({ template: { transformAssetUrls } }),
      quasar(),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/app/styles/quasar-variables.scss" as *;',
        },
      },
    },
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    server: { port: Number(env.PORT) || 3000, strictPort: true },
    preview: { port: Number(env.PORT) || 3000, strictPort: true },

    define: {
      __APP_CONFIG__: {
        VITE_API_URL: JSON.stringify(env.VITE_BASE_URL || '/api'),
        VITE_DEFAULT_LIMIT: Number(env.VITE_DEFAULT_LIMIT || 20),
        VITE_MAX_LIMIT: Number(env.VITE_MAX_LIMIT || 100),
      },
    },

    build: { sourcemap: true },
  };
});