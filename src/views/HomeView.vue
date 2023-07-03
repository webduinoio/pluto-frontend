<script lang="ts" setup>
import TheActor from '@/components/TheActor.vue';
import { ACTOR_TYPE } from '@/enums';
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

const onEdit = (id: number) => {
  store.actorEditId = id;
  router.push({
    name: 'ActorEdit',
  });
};

const onOpen = (data: Actor) => {
  store.actorOpenID = data.id;
  if (data.type === ACTOR_TYPE.QUIZ) {
    router.push({
      name: 'StudyBuddyQuestion',
    });
  } else {
    router.push({
      name: 'StudyBuddyQA',
    });
  }
};
</script>

<template>
  <v-container class="mb-6 d-flex justify-center">
    <v-responsive max-width="1024">
      <div class="d-flex justify-space-between my-15">
        <div class="text-h4">我的小書僮</div>
        <v-btn color="teal" prepend-icon="mdi-plus" @click="router.push({ name: 'ActorCreation' })">
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

<style lang="scss"></style>
