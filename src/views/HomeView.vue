<script lang="ts" setup>
import TheActor from '@/components/TheActor.vue';
import { NOTIFICATION_TIMEOUT } from '@/config';
import { ACTOR_TYPE, ROUTER_NAME } from '@/enums';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { deleteActor, getActors, toggleShareActor } from '@/services';
import { useAuthorizerStore } from '@/stores/authorizer';
import { useNotificationStore } from '@/stores/notification';
import { useOAuthStore } from '@/stores/oauth';
import type { Actor } from '@/types';
import { mdiCheck, mdiClose, mdiPlus, mdiSchoolOutline } from '@mdi/js';
import { get, set } from '@vueuse/core';
import { onActivated, onDeactivated } from 'vue';

const { fire, showLoading, hideLoading } = useSweetAlert();
const router = useRouter();
const notification = useNotificationStore();
const oauth = useOAuthStore();
const authorizer = useAuthorizerStore();
const user = oauth.user;

// TODO: 待調整
const data = ref<Actor[]>([]);
const dataLastIndex = ref('');
const dialog = ref(false);
const scrollPosition = ref(0);

onActivated(() => {
  window.addEventListener('scroll', handleScroll);
  window.scrollTo({
    top: scrollPosition.value,
    behavior: 'auto',
  });
});

onDeactivated(() => {
  window.removeEventListener('scroll', handleScroll);
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
      notification.fire('小書僮數量已滿', 'top');
    } else {
      dialog.value = true;
    }
  } else {
    router.push({ name: ROUTER_NAME.ACTOR_CREATION });
  }
};

const onClick = () => {
  window.open('https://store.webduino.io/products/ai-tutor', '_blank');
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
  <v-container class="mb-6 d-flex justify-center">
    <v-responsive max-width="1024">
      <div class="d-flex justify-space-between mt-15">
        <div class="text-h4">我的小書僮</div>
        <v-btn
          color="primary"
          :prepend-icon="mdiPlus"
          @click="onCreate"
          v-if="authorizer.canCreate"
        >
          新增小書僮
        </v-btn>
      </div>
      <v-main>
        <v-container>
          <v-infinite-scroll
            :items="data"
            :onLoad="onLoad"
            class="overflow-x-hidden"
            empty-text="&nbsp;"
            min-height="100"
          >
            <v-row>
              <TheActor
                v-for="item in data"
                :key="item.id"
                height="380"
                width="310"
                class="ma-2 pa-2"
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
            </v-row>
            <template v-slot:empty> <span class="mt-5">已經到底了喔！</span> </template>
          </v-infinite-scroll>
        </v-container>
      </v-main>
    </v-responsive>
  </v-container>
  <v-dialog v-model="dialog" max-width="729px">
    <v-card class="rounded-lg" color="background">
      <template #append>
        <v-btn variant="text" :icon="mdiClose" @click="dialog = false"></v-btn>
      </template>

      <div class="mx-16">
        <v-card-item class="pa-0">
          <v-card-title class="text-center text-h4 font-weight-bold">
            免費額度已到達上限囉！
          </v-card-title>
          <v-card-subtitle
            class="text-center text-subtitle-2 mt-3 font-weight-medium text-black"
            style="opacity: 1"
          >
            成為 PRO 加倍提升教學效率
          </v-card-subtitle>
        </v-card-item>

        <v-divider class="mx-6 my-3"></v-divider>

        <v-card-text>
          <v-row>
            <v-col class="d-flex justify-center justify-space-around align-end pa-0">
              <span class="text-h5 text-info font-weight-bold">免費版</span>
              <span class="text-info font-weight-bold" style="line-height: 1.7rem">NT$ 0 /月</span>
            </v-col>
            <v-col class="d-flex justify-center justify-space-around align-end pa-0">
              <span class="text-h5 text-secondary font-weight-bold"
                ><v-icon color="secondary" :icon="mdiSchoolOutline"></v-icon> PRO 版</span
              >
              <span class="text-secondary font-weight-bold" style="line-height: 1.7rem"
                >NT$ 3,000 /年</span
              >
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center justify-space-around">
            <v-card
              class="rounded-lg"
              width="250px"
              style="border: 1px solid lightgray; box-shadow: none"
            >
              <v-card-text class="ma-3">
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>2 支小書僮</strong>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>5 個檔案</strong>&nbsp;
                  <small>/每支小書僮</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>20 頁</strong>&nbsp;
                  <small>/每個檔案</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>20 MB</strong>&nbsp;
                  <small>/每個檔案</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>20 個問題數</strong>&nbsp;
                  <small>/每日</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>推薦問題</strong>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>參考資料</strong>
                </v-row>
                <v-row>
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>引用標籤</strong>
                </v-row>
              </v-card-text>
            </v-card>

            <v-card
              class="rounded-lg"
              width="250px"
              style="border: 1px solid lightgray; box-shadow: none"
            >
              <v-card-text class="ma-3">
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong class="text-secondary">10 支小書僮</strong>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong>10 個檔案</strong>&nbsp;
                  <small>/每支小書僮</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong class="text-secondary">500 頁</strong>&nbsp;
                  <small class="text-secondary font-weight-bold">/每個檔案</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong class="text-secondary">40 MB</strong>&nbsp;
                  <small class="text-secondary font-weight-bold">/每個檔案</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong class="text-secondary">300 個問題數</strong>&nbsp;
                  <small class="text-secondary font-weight-bold">/每日</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong>推薦問題</strong>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong>參考資料</strong>
                </v-row>
                <v-row>
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong>引用標籤</strong>
                </v-row>
              </v-card-text>
            </v-card>
          </v-row>

          <v-row class="mb-3 mt-3">
            <v-col class="d-flex justify-center align-center">
              <span class="text-secondary">目前方案</span>
            </v-col>
            <v-col class="d-flex justify-center align-center">
              <v-btn variant="flat" class="px-6" color="secondary" @click="onClick">
                成為 PRO
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </div>
    </v-card>
  </v-dialog>
</template>

<style>
.v-overlay-scroll-blocked {
  padding-inline-end: 0;
}
</style>
