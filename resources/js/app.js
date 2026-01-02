import './bootstrap';
import '../css/app.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Tambahkan Pinia sekalian
import router from './router';      // Tambahkan Router
import App from './App.vue';

import 'vue-sonner/style.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');