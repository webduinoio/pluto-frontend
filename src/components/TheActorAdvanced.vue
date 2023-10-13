<script setup lang="ts">
import { useActorStore } from '@/stores/actor';
import type { Actor } from '@/types';
import { get, set } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import ActorAdvancedSelfMode from './ActorAdvancedSelfMode.vue';
import ActorAdvancedTemplate from './ActorAdvancedTemplate.vue';

const props = withDefaults(
  defineProps<{
    value: string;
  }>(),
  {}
);

// TODO: 僅管理者可使用自訂模式
const isAdmin = ref(true);

const actorStore = useActorStore();
const { editActor } = storeToRefs(actorStore);
const mode = ref('template');

const buttonText = computed(() => {
  if (get(mode) === 'self') return '返回模板';
  return '切換自訂模式';
});

const onClick = () => {
  if (get(mode) === 'self') {
    set(mode, 'template');
  } else {
    set(mode, 'self');
  }
};

const onSubmit = (value: Actor) => {
  set(editActor, value);
};
</script>

<template>
  <div class="d-flex justify-end" v-if="isAdmin">
    <v-btn variant="text" @click="onClick" class="text-grey">
      {{ buttonText }}
    </v-btn>
  </div>

  <v-window-item :value="props.value">
    <ActorAdvancedSelfMode v-show="mode === 'self'" v-model:actor="editActor" />
    <ActorAdvancedTemplate v-show="mode === 'template'" v-model:actor="editActor" />
  </v-window-item>
</template>

<style scoped></style>
