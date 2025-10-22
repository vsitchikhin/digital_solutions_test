import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: import('@/pages/EntitiesPage.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});