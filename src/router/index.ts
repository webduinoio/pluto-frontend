import { Action, Permission, ROUTER_NAME } from '@/enums';
import LayoutDefault from '@/layouts/default/Default.vue';
import { getPermissions, getUser, getUserPlan, logout } from '@/services';
import { useAuthorizerStore } from '@/stores/authorizer';
import { useOAuthStore } from '@/stores/oauth';
import { useRouteStore } from '@/stores/route';
import type { RouteLocationNormalized } from 'vue-router';
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
          path: 'edit/:id',
          name: ROUTER_NAME.ACTOR_EDIT,
          component: () => import('@/views/ActorEditView.vue'),
        },
        {
          path: 'qa/:id',
          name: ROUTER_NAME.STUDY_BUDDY_QA,
          component: () => import('@/views/StudyBuddyQAView.vue'),
        },
        {
          path: 'generate-question/:id',
          name: ROUTER_NAME.STUDY_BUDDY_QUESTION,
          component: () => import('@/views/StudyBuddyQuestionView.vue'),
        },
        {
          path: 'google-sheet/:id',
          name: ROUTER_NAME.STUDY_BUDDY_GOOGLE_SHEET,
          component: () => import('@/views/StudyBuddyGoogleSheetView.vue'),
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
    {
      path: '/:catchAll(.*)',
      redirect: { name: ROUTER_NAME.HOME },
    },
  ],
});

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next) => {
  const route = useRouteStore();
  const oauth = useOAuthStore();
  const authorizer = useAuthorizerStore();

  try {
    if (route.to !== null) {
      const path = route.to.path as string
      route.to = null;
      next({ path: path });
      return;
    }

    if (oauth.user === null) {
      oauth.user = (await getUser()).data;
    }
    if (oauth.plan === null) {
      oauth.plan = (await getUserPlan()).data;
    }

    // TODO: check whether `authorizer.permissions` has value first and reset it before logout
    if (oauth.user) {
      const resp = await getPermissions(oauth.user.role.name);
      authorizer.permissions = resp?.data.data;
      authorizer.user = oauth.user.role.name;
      authorizer.canReadAll = authorizer.can(Action.READ, Permission.ACTOR_ADMIN);
      authorizer.canRead = authorizer.can(Action.READ, Permission.ACTOR_NORMAL);
      authorizer.canCreate = authorizer.can(Action.CREATE, Permission.ACTOR_ADMIN);
      authorizer.canEditAll = authorizer.can(Action.EDIT, Permission.ACTOR_ADMIN);
      authorizer.canEdit = authorizer.can(Action.EDIT, Permission.ACTOR_NORMAL);
      authorizer.canDeleteAll = authorizer.can(Action.DELETE, Permission.ACTOR_ADMIN);
      authorizer.canDelete = authorizer.can(Action.DELETE, Permission.ACTOR_NORMAL);
    }
    next();
  } catch (error) {
    console.error(error);
    route.to = to;
    logout();
    next(false)
  }
});

export default router;
