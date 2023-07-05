import { ROUTER_NAME } from '@/enums';
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
          name: ROUTER_NAME.HOME,
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: 'create',
          name: ROUTER_NAME.ACTOR_CREATION,
          component: () => import('@/views/ActorCreationView.vue'),
        },
        {
          path: 'edit',
          name: ROUTER_NAME.ACTOR_EDIT,
          component: () => import('@/views/ActorEditView.vue'),
        },
        {
          path: 'qa',
          name: ROUTER_NAME.STUDY_BUDDY_QA,
          component: () => import('@/views/StudyBuddyQAView.vue'),
        },
        {
          path: 'generate-question',
          name: ROUTER_NAME.STUDY_BUDDY_QUESTION,
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
