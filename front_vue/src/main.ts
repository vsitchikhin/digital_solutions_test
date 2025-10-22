import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createPinia } from 'pinia';
import { Quasar } from 'quasar';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import '@/app/styles/main.scss';
import { router } from '@/app/router';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(Quasar);

app.mount('#app');
