import './prototypes/array';

import { createApp } from 'vue'
import App from './App.vue';
const app = createApp(App);

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';

import BootstrapVueNext from 'bootstrap-vue-next';
app.use(BootstrapVueNext);

app.mount('#app')