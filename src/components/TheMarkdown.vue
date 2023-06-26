<script setup lang="ts">
/**
 * 使用 showdown.js 來呈現 markdown 的內容
 */
import { set } from '@vueuse/core';
import showdown from 'showdown';

const props = withDefaults(
  defineProps<{
    value: string;
  }>(),
  {
    value: '',
  }
);

const html = ref('');
const converter = new showdown.Converter();

watch(
  () => props.value,
  (val) => {
    const text = val.length ? converter.makeHtml(val) : '';
    set(html, text);
  },
  { immediate: true }
);
</script>

<template>
  <div v-html="html"></div>
</template>
