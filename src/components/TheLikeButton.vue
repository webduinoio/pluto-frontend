<script setup lang="ts">
import { mdiThumbUp, mdiThumbUpOutline } from '@mdi/js';

const props = withDefaults(
  defineProps<{
    modelValue: boolean | undefined;
  }>(),
  {
    modelValue: undefined,
  }
);
</script>

<template>
  <v-btn
    variant="text"
    density="compact"
    :icon="
      props.modelValue === undefined
        ? mdiThumbUpOutline
        : props.modelValue
        ? mdiThumbUp
        : mdiThumbUpOutline
    "
  ></v-btn>
</template>

<style lang="scss" scoped></style>
