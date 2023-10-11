<script lang="ts" setup>
import TheActor from '@/components/TheActor.vue';
import TheProductPlans from '@/components/TheProductPlans.vue';
import { NOTIFICATION_TIMEOUT } from '@/config';
import { ACTOR_TYPE, ROUTER_NAME } from '@/enums';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { deleteActor, getActors, toggleShareActor } from '@/services';
import { useActorStore } from '@/stores/actor';
import { useAuthorizerStore } from '@/stores/authorizer';
import { useNotificationStore } from '@/stores/notification';
import { useOAuthStore } from '@/stores/oauth';
import type { Actor } from '@/types';
import { mdiPlus } from '@mdi/js';
import { get, set } from '@vueuse/core';
import { onActivated, onDeactivated } from 'vue';
import { useDisplay } from 'vuetify';

const { fire, showLoading, hideLoading } = useSweetAlert();
const router = useRouter();
const notification = useNotificationStore();
const oauth = useOAuthStore();
const actorStore = useActorStore();
const authorizer = useAuthorizerStore();
const { smAndUp, width } = useDisplay();
const user = oauth.user;

// TODO: 待調整
const data = ref<Actor[]>([]);
const dataLastIndex = ref('');
const dialog = ref(false);
const scrollPosition = ref(0);
const containerWidth = computed(() => {
  if (width.value < 750) return `340px`;
  if (width.value < 1280) return `${340 * 2}px`;
  if (width.value < 1920) return `${340 * 3}px`;
  return `${340 * 5}px`;
});

onActivated(() => {
  window.addEventListener('scroll', handleScroll);

  if (actorStore.refreshActors) {
    set(data, []);
    set(dataLastIndex, '');
  } else {
    window.scrollTo({
      top: scrollPosition.value,
      behavior: 'auto',
    });
  }
});

onDeactivated(() => {
  window.removeEventListener('scroll', handleScroll);
  actorStore.refreshActors = false;
});

const handleScroll = () => {
  set(scrollPosition, window.scrollY);
};

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
    set(dataLastIndex, value.lastIndex);

    hideLoading();
  } catch (err: any) {
    console.error(err);
    fire({
      title: '刪除小助教發生錯誤',
      icon: 'error',
      text: err.message,
      showConfirmButton: false,
      timer: NOTIFICATION_TIMEOUT,
    });
  }
};

const onCopy = async (actor: Actor) => {
  if (actor.createdBy === user?.id || authorizer.canEditAll) {
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

const onCreate = () => {
  const myActors = data.value.filter((datum) => datum.createdBy === oauth.user?.id);
  if (oauth.plan?.actorQuota && myActors.length >= oauth.plan.actorQuota) {
    if (oauth.plan.name !== 'free') {
      notification.fire('小助教數量已滿', 'top');
    } else {
      dialog.value = true;
    }
  } else {
    router.push({ name: ROUTER_NAME.ACTOR_CREATION });
  }
};

const loadActors = async () => {
  try {
    const { data: value } = await getActors({
      lastIndex: get(dataLastIndex),
    });
    if (value.list) {
      data.value.push(...value.list);
      set(dataLastIndex, value.lastIndex);
    }
    return value;
  } catch (err) {
    console.error(err);
    return { list: null };
  }
};

const onLoad = async ({ done }: { done: Function }) => {
  try {
    const value = await loadActors();
    if (value.list) {
      done('ok');
    } else {
      done('empty');
    }
  } catch (err) {
    console.error(err);
    done('error');
  }
};
</script>

<template>
  <v-container class="mb-6">
    <div class="d-flex justify-space-between mt-5 mt-sm-15 px-sm-16">
      <div class="text-h4 font-weight-bold">我的小助教</div>
      <div v-if="authorizer.canCreate">
        <v-btn v-if="smAndUp" color="primary" :prepend-icon="mdiPlus" @click="onCreate">
          新增小助教
        </v-btn>
        <v-btn color="primary" v-else :icon="mdiPlus" size="small" @click="onCreate"></v-btn>
      </div>
    </div>
    <v-container>
      <v-infinite-scroll
        :items="data"
        :onLoad="onLoad"
        class="overflow-x-hidden"
        empty-text="&nbsp;"
        min-height="100"
      >
        <v-container :style="{ 'max-width': containerWidth }">
          <v-row>
            <v-col v-for="item in data" :key="item.id" cols="auto">
              <TheActor
                class="pa-2"
                max-width="310"
                height="380"
                :data="item"
                :can-edit="authorizer.canEdit"
                :can-edit-all="authorizer.canEditAll"
                :can-delete="authorizer.canDelete"
                :can-delete-all="authorizer.canDeleteAll"
                @edit="onEdit"
                @open="onOpen"
                @delete="onDelete"
                @copy="onCopy"
              />
            </v-col>
          </v-row>
        </v-container>
        <template v-slot:empty> <span class="mt-5">已經到底了喔！</span> </template>
      </v-infinite-scroll>
    </v-container>
    <v-footer class="justify-center custom-footer mt-16 text-h6">
      <a href="https://webduino.io/" target="_blank" class="custom-footer-text"> Webduino </a>
      <span class="mx-1 custom-footer-text">·</span>
      <a href="https://account.webduino.io/privacy" target="_blank" class="custom-footer-text">
        Policy
      </a>
      <span class="mx-1 custom-footer-text">·</span>
      <a href="https://www.facebook.com/webduino" target="_blank" class="custom-footer-text">
        Facebook
      </a>
      <span class="mx-1 custom-footer-text">·</span>
      <a
        href="https://www.youtube.com/channel/UCUk3U7QZqijQfE-7rAh_INQ"
        target="_blank"
        class="custom-footer-text"
      >
        YouTube
      </a>
    </v-footer>
  </v-container>
  <TheProductPlans v-model="dialog" />
</template>

<style>
.v-overlay-scroll-blocked {
  padding-inline-end: 0;
}
</style>

<style scoped lang="scss">
.custom-footer {
  background-color: unset !important;

  .custom-footer-text {
    color: #938f99;
    font-size: 20px;
    font-family: 'Poppins', sans-serif;
  }
}
</style>
