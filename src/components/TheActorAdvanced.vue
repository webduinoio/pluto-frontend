<script setup lang="ts">
import type { Actor } from '@/types';
import ActorAdvancedSelfMode from './ActorAdvancedSelfMode.vue';

const props = withDefaults(
  defineProps<{
    value: string;
    actor: Actor | undefined;
  }>(),
  {}
);
</script>

<template>
  <ActorAdvancedSelfMode :value="props.value" :actor="props.actor" />
</template>

<style scoped></style>
