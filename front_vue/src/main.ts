import { createApp } from 'vue';
import App from './App.vue';

import { createPinia } from 'pinia';
import { router } from '@/app/router';

import { Quasar } from 'quasar';

import './style.css';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

function showFatal(e: unknown) {
  try {
    const msg =
      e instanceof Error ? `${e.name}: ${e.message}\n${e.stack ?? ''}` :
        typeof e === 'string' ? e : JSON.stringify(e);
    const box = document.createElement('pre');
    box.style.cssText = 'position:fixed;inset:8px;z-index:99999;background:#200;color:#fff;border:2px solid #f44;padding:10px;white-space:pre-wrap;font:12px ui-monospace,monospace';
    box.textContent = `FATAL:\n${msg}`;
    document.body.appendChild(box);
  } catch {}
}
window.addEventListener('error', ev => showFatal(ev.error ?? ev.message));
window.addEventListener('unhandledrejection', ev => showFatal(ev.reason));

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Quasar, {});

app.mount('#app');
