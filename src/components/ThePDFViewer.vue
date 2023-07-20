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

var ele = document.getElementById('pdfContainer');
myPDF.setViewElement(ele);

(async function () {
  //myPDF.load('../book.pdf');
})();
</script>

<template>
  <div v-html="html" id="pdfContainer"></div>
</template>
<style>
#pdfContainer {
  overflow-y: scroll;
}

.highlight {
  color: brown;
  background-color: rgb(33, 20, 205);
}
</style>
