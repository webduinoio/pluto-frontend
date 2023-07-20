<template>
  <div>
    <canvas id="pdf-canvas"></canvas>
    <div id="page_controls">
      <button v-on:click="onPrevPage">Previous</button>
      <button v-on:click="onNextPage">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { onMounted, ref } from 'vue';

const props = defineProps<{
  value: string;
}>();

const pdfDocument = ref<PDFDocumentProxy | null>(null);
const pageNum = ref(1);
const pageRendering = ref(false);
const pageNumPending = ref<number | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(async () => {
  console.log('okok');
});

const renderPage = (num: number) => {
  pageRendering.value = true;

  pdfDocument.value?.getPage(num).then((page) => {
    const scale = 1.5;
    const viewport = page.getViewport({ scale: scale });
    const context = canvas.value?.getContext('2d');
    if (context && canvas.value) {
      canvas.value.height = viewport.height;
      canvas.value.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      const renderTask = page.render(renderContext);

      renderTask.promise.then(() => {
        pageRendering.value = false;
        if (pageNumPending.value !== null) {
          renderPage(pageNumPending.value);
          pageNumPending.value = null;
        }
      });
    }
  });

  pageNum.value = num;
};

const queueRenderPage = (num: number) => {
  if (pageRendering.value) {
    pageNumPending.value = num;
  } else {
    renderPage(num);
  }
};

const onPrevPage = () => {
  if (pageNum.value <= 1) {
    return;
  }
  pageNum.value--;
  queueRenderPage(pageNum.value);
};

const onNextPage = () => {
  if (pdfDocument.value && pageNum.value >= pdfDocument.value.numPages) {
    return;
  }
  pageNum.value++;
  queueRenderPage(pageNum.value);
};
</script>
