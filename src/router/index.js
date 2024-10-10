import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import UserLogin from '@/views/UserLogin.vue';
import UserLogout from '@/views/UserLogout.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: UserLogin },
  { path: '/logout', component: UserLogout },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;