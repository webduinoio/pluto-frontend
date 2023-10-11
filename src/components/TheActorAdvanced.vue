<script setup lang="ts">
import type { Actor } from '@/types';
import { get, set } from '@vueuse/core';
import ActorAdvancedSelfMode from './ActorAdvancedSelfMode.vue';
import ActorAdvancedTemplate from './ActorAdvancedTemplate.vue';

const props = withDefaults(
  defineProps<{
    value: string;
    actor: Actor | undefined;
  }>(),
  {}
);

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
</script>

<template>
  <div class="d-flex justify-end">
    <v-btn variant="text" @click="onClick" class="text-grey">
      {{ buttonText }}
    </v-btn>
  </div>

  <v-window-item :value="props.value">
    <ActorAdvancedSelfMode v-show="mode === 'self'" :actor="props.actor" />
    <ActorAdvancedTemplate v-show="mode === 'template'" :actor="props.actor" />
  </v-window-item>
</template>

<style scoped></style>
