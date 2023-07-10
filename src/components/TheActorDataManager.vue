<script setup lang="ts">
import type { Actor } from '@/types';
import ActorDataManagerFile from './ActorDataManagerFile.vue';
import ActorDataManagerQA from './ActorDataManagerQA.vue';

const props = withDefaults(
  defineProps<{
    value: string;
    actor: Actor | undefined;
  }>(),
  {}
);

// const emit = defineEmits<{
//   (e: 'create'): void;
//   (e: 'update'): void;
// }>();

const tab = ref();
</script>

<template>
  <v-window-item :value="props.value">
    <v-tabs v-model="tab" class="text-grey" color="black">
      <v-tab class="text-h6 px-16" value="file">檔案</v-tab>
      <v-tab class="text-h6 px-16" value="qa">Q & A</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <ActorDataManagerFile value="file" :actor="props.actor" />
      <ActorDataManagerQA value="qa" :actor="props.actor" />
    </v-window>
  </v-window-item>
</template>

<style scoped></style>
