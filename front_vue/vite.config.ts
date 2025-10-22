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
  };
});
