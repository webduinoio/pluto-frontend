<script setup lang="ts">
import { COLOR } from '@/enums/style';
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
    :style="{ color: COLOR.GREY_01 }"
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
