<script setup lang="ts">
import { mdiThumbDown, mdiThumbDownOutline } from '@mdi/js';

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
        ? mdiThumbDownOutline
        : props.modelValue
        ? mdiThumbDown
        : mdiThumbDownOutline
    "
  ></v-btn>
</template>

<style lang="scss" scoped></style>
