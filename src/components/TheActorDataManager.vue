<script setup lang="ts">
import type { Actor } from '@/types';
import { set } from '@vueuse/core';
import ActorDataManagerFile from './ActorDataManagerFile.vue';
import ActorDataManagerQA from './ActorDataManagerQA.vue';

const props = withDefaults(
  defineProps<{
    value: string;
    actor: Actor | undefined;
  }>(),
  {}
);

const datum = ref<Actor>();

// const emit = defineEmits<{
//   (e: 'create'): void;
//   (e: 'update'): void;
// }>();

watch(
  () => props.actor,
  (val) => {
    set(datum, val);
  }
);

const tab = ref();
</script>

<template>
  <v-window-item :value="props.value">
    <v-tabs v-model="tab" class="text-grey" color="black">
      <v-tab class="text-h6 px-16" value="file">檔案</v-tab>
      <v-tab class="text-h6 px-16" value="qa">Q & A</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <ActorDataManagerFile value="file" :actor="datum" />
      <ActorDataManagerQA value="qa" :actor="datum" />
    </v-window>
  </v-window-item>
</template>

<style scoped></style>
