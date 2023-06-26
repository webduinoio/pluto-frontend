import LayoutDefault from '@/layouts/default/Default.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: LayoutDefault,
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: 'create',
          name: 'ActorCreation',
          component: () => import('@/views/ActorCreationView.vue'),
        },
      ],
    },
    {
      path: '/test',
      component: LayoutDefault,
      children: [
        {
          path: 'splitpanes',
          component: () => import('@/testViews/SplitpanesView.vue'),
        },
      ],
    },
  ],
});

export default router;
