<script lang="ts" setup>
import TheActor from '@/components/TheActor.vue';
import { ACTOR_TYPE, ROUTER_NAME } from '@/enums';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { deleteActor, getActors } from '@/services';
import { useMainStore } from '@/stores/main';
import type { Actor } from '@/types';
import { set } from '@vueuse/core';

const { fire, showLoading, hideLoading } = useSweetAlert();
const router = useRouter();
const store = useMainStore();

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
  store.setEditData(data);
  router.push({
    name: ROUTER_NAME.ACTOR_EDIT,
  });
};

const getRouterName = (type: ACTOR_TYPE) => {
  if (type === ACTOR_TYPE.QUIZ) return ROUTER_NAME.STUDY_BUDDY_QUESTION;
  if (type === ACTOR_TYPE.SHEET) return ROUTER_NAME.STUDY_BUDDY_GOOGLE_SHEET;
  return ROUTER_NAME.STUDY_BUDDY_QA;
};

const onOpen = (data: Actor) => {
  store.actorOpenID = data.id;
  router.push({
    name: getRouterName(data.type),
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
      timer: 1500,
    });
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
          prepend-icon="mdi-plus"
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
            />
          </v-row>
        </v-container>
      </v-main>
    </v-responsive>
  </v-container>
</template>
