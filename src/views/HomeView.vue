<script lang="ts" setup>
import TheActor from '@/components/TheActor.vue';
import { NOTIFICATION_TIMEOUT } from '@/config';
import { ACTOR_TYPE, ROUTER_NAME } from '@/enums';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { deleteActor, getActors, toggleShareActor } from '@/services';
import { useNotificationStore } from '@/stores/notification';
import { useOAuthStore } from '@/stores/oauth';
import type { Actor } from '@/types';
import { mdiPlus } from '@mdi/js';
import { set } from '@vueuse/core';

const { fire, showLoading, hideLoading } = useSweetAlert();
const router = useRouter();
const notification = useNotificationStore();
const oauth = useOAuthStore();
const user = oauth.user;

// TODO: 待調整
const data = ref<Actor[]>([]);

onMounted(async () => {
  try {
    const { data: value } = await getActors();
    set(data, value.list || []);
  } catch (err) {
    console.error(err);
  }
});

const onEdit = (data: Actor) => {
  router.push({
    name: ROUTER_NAME.ACTOR_EDIT,
    params: { id: data.id },
  });
};

const getRouterName = (type: ACTOR_TYPE) => {
  if (type === ACTOR_TYPE.QUIZ) return ROUTER_NAME.STUDY_BUDDY_QUESTION;
  if (type === ACTOR_TYPE.SHEET) return ROUTER_NAME.STUDY_BUDDY_GOOGLE_SHEET;
  return ROUTER_NAME.STUDY_BUDDY_QA;
};

const getRouterPath = (type: ACTOR_TYPE) => {
  return {
    [ACTOR_TYPE.TUTORIAL]: 'qa',
    [ACTOR_TYPE.SHEET]: 'google-sheet',
    [ACTOR_TYPE.QUIZ]: 'generate-question',

    // TODO: 名稱待確認，要符合 router 的命名。
    [ACTOR_TYPE.WEBBIT]: 'webbit',
    [ACTOR_TYPE.PYTHON]: 'python',
  }[type];
};

const onOpen = (data: Actor) => {
  router.push({
    name: getRouterName(data.type),
    params: { id: data.id },
  });
};

const onDelete = async (id: number) => {
  try {
    showLoading();
    await deleteActor(id);

    const { data: value } = await getActors();
    set(data, value.list || []);

    hideLoading();
  } catch (err: any) {
    console.error(err);
    fire({
      title: '刪除小書僮發生錯誤',
      icon: 'error',
      text: err.message,
      showConfirmButton: false,
      timer: NOTIFICATION_TIMEOUT,
    });
  }
};

const onCopy = async (actor: Actor) => {
  if (actor.createdBy === user?.id) {
    await toggleShareActor(actor.id);
    actor.shared = !actor.shared;
  }

  if (actor.shared) {
    await navigator.clipboard.writeText(
      `${location.origin}/${getRouterPath(actor.type)}/${actor.id}`
    );
  }

  notification.fire(actor.shared ? '分享連結已複製' : '已停止分享', 'top');
};
</script>

<template>
  <v-container class="mb-6 d-flex justify-center">
    <v-responsive max-width="1024">
      <div class="d-flex justify-space-between mt-15">
        <div class="text-h4">我的小書僮</div>
        <v-btn
          color="primary"
          :prepend-icon="mdiPlus"
          @click="router.push({ name: ROUTER_NAME.ACTOR_CREATION })"
        >
          新增小書僮
        </v-btn>
      </div>
      <v-main>
        <v-container>
          <v-row>
            <TheActor
              v-for="item in data"
              :key="item.id"
              height="380"
              width="320"
              class="ma-2 pa-2"
              :data="item"
              @edit="onEdit"
              @open="onOpen"
              @delete="onDelete"
              @copy="onCopy"
            />
          </v-row>
        </v-container>
      </v-main>
    </v-responsive>
  </v-container>
</template>
