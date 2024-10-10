import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'; // 导入 Vuex store
import Cookies from 'js-cookie';


const app = createApp(App)

store.state.user = JSON.parse(Cookies.get('user') || 'null');
store.state.isAuthenticated = !!Cookies.get('user');

app.use(store);
app.use(router)

app.mount('#app')