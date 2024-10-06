import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import UserLogin from '../views/UserLogin.vue';
import About from '../views/AboutView.vue';
import UserLogout from '../views/UserLogout.vue';
import ProfileView from '@/views/ProfileView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: UserLogin },
  { path: '/about', component: About },
  { path: '/logout', component: UserLogout },
  { path: '/profile', component: ProfileView}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
