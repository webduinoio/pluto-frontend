<script setup lang="ts">
/**
 * 使用 showdown.js 來呈現 markdown 的內容
 */

const props = withDefaults(
  defineProps<{
    value: string;
  }>(),
  {
    value: '',
  }
);

const html = ref('');
const myPDF = pdf;

watch(
  () => props.value,
  (val) => {
    console.log('watch>>>', val);
  },
  { immediate: true }
);

import { onMounted, ref } from 'vue';
onMounted(() => {
  const ele = document.getElementById('pdfContainer');
  myPDF.setViewElement(ele);
});
</script>

<template>
  <div v-html="html" id="pdfContainer"></div>
</template>
<style>
#pdfContainer {
  overflow-y: scroll;
}

.pdfContainer-highlight {
  color: brown;
  background-color: rgb(33, 20, 205);
}

.pdfContainer-overlay {
  z-index: 900;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  top: 0;
  left: 0;
}

.pdfContainer-loading {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  font-size: 3em;
  width: 100%;
}
</style>
