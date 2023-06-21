<script lang="ts" setup>
import TheActor from '@/components/TheActor.vue';

const router = useRouter();

// TODO: 待調整
const data = ref([
  {
    createdBy: 1,
    description: '測試用1',
    id: 3,
    image: 'https://photo.webduino.io/chat/cover.webp',
    name: '小書僮2',
    temperature: 0,
    url: 'https://google.com',
  },
  {
    createdBy: 1,
    description: '測試用2',
    id: 4,
    image: 'https://photo.webduino.io/chat/cover.webp',
    name: '小書僮2',
    temperature: 0,
    url: 'https://google.com',
  },
]);

// TODO: 待調整
const onEdit = (id: number) => {
  console.log('onEdit id:', id);
};

// TODO: 待調整
const onOpen = (id: number) => {
  console.log('onOpen id:', id);
};
</script>

<template>
  <v-container class="mb-6 d-flex justify-center">
    <v-responsive max-width="1024">
      <div class="d-flex justify-space-between my-15">
        <div class="text-h4">我的小書僮</div>
        <v-btn color="teal" prepend-icon="mdi-plus" @click="router.push({ name: 'ActorCreation' })"
          >新增小書僮</v-btn
        >
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
