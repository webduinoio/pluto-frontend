<script lang="ts" setup>
import TheActor from '@/components/TheActor.vue';
import { ACTOR_TYPE, ROUTER_NAME } from '@/enums';
import { getActors } from '@/services';
import { useMainStore } from '@/stores/main';
import type { Actor } from '@/types';
import { set } from '@vueuse/core';

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

const onOpen = (data: Actor) => {
  store.actorOpenID = data.id;
  if (data.type === ACTOR_TYPE.QUIZ) {
    router.push({
      name: ROUTER_NAME.STUDY_BUDDY_QUESTION,
    });
  } else {
    router.push({
      name: ROUTER_NAME.STUDY_BUDDY_QA,
    });
  }
};
</script>

<template>
  <v-container class="mb-6 d-flex justify-center">
    <v-responsive max-width="1024">
      <div class="d-flex justify-space-between my-15">
        <div class="text-h4">我的小書僮</div>
        <v-btn
          color="teal"
          prepend-icon="mdi-plus"
          @click="router.push({ name: ROUTER_NAME.ACTOR_CREATION })"
        >
          新增小書僮
        </v-btn>
      </div>
      <v-row class="mx-auto">
        <TheActor
          v-for="item in data"
          :key="item.id"
          height="380"
          width="320"
          class="ma-2 pa-2"
          :data="item"
          @edit="onEdit"
          @open="onOpen"
        />
      </v-row>
    </v-responsive>
  </v-container>
</template>
