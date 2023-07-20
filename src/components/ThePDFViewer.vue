<script setup lang="ts">
declare global {
  interface Window {
    pdf: any;
  }
}
import PDF from '../waPDF.js';
const myPDF = new PDF();

onMounted(() => {
  const ele = document.getElementById('pdfContainer');
  myPDF.setViewElement(ele);

  window.pdf = myPDF;
});
</script>

<template>
  <div id="pdfContainer"></div>
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
  font-size: 1.6em;
  width: 100%;
}
</style>
../waPDF.js
