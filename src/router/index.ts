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
        {
          path: 'edit',
          name: 'ActorEdit',
          component: () => import('@/views/ActorEditView.vue'),
        },
        {
          path: 'qa',
          name: 'StudyBuddyQA',
          component: () => import('@/views/StudyBuddyQAView.vue'),
        },
        {
          path: 'generate-question',
          name: 'StudyBuddyQuestion',
          component: () => import('@/views/StudyBuddyQuestionView.vue'),
        },
      ],
    },
    {
      path: '/_test',
      component: LayoutDefault,
      children: [
        {
          path: 'splitpanes',
          component: () => import('@/testViews/SplitpanesView.vue'),
        },
        {
          path: 'markdown',
          component: () => import('@/testViews/MarkdownView.vue'),
        },
        {
          path: 'mqtt',
          component: () => import('@/testViews/MqttView.vue'),
        },
      ],
    },
  ],
});

export default router;
