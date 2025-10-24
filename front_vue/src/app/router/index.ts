import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import EntitiesPage from '@/pages/EntitiesPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: EntitiesPage,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});