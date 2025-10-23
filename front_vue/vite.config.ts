import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import path from 'node:path';

// https://vite.dev/config/
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
        BASE_URL: JSON.stringify(env.BASE_URL || 'http://localhost:4000'),
        DEFAULT_LIMIT: Number(env.DEFAULT_LIMIT || 20),
        MAX_LIMIT: Number(env.MAX_LIMIT || 100),
      },
    },
  };
});
