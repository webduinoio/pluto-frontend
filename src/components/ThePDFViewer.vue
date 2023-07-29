<script setup lang="ts">
declare global {
  interface Window {
    pdf: any;
  }
}
import PDF from '../waPDF_ts.js';
const pdf = new PDF();

onMounted(() => {
  const ele = document.getElementById('pdfContainer');
  pdf.setViewElement(ele);
  window.pdf = pdf;
  pdf.setViewElement(document.getElementById('pdfContainer'), document.getElementById('pageShow'));
  var searchInput = document.querySelector('.page-tool-input') as HTMLInputElement;
  var flag = false;
  searchInput.addEventListener('compositionstart', function () {
    flag = true;
  });
  searchInput.addEventListener('compositionupdate', function () {
    flag = true;
  });
  searchInput.addEventListener('compositionend', function (ev) {
    handleInput(ev.data);
    flag = false;
  });
  (searchInput as any).addEventListener('input', (ev: any) => {
    if (!flag) handleInput(ev.data);
  });
  function handleInput(value: string) {
    console.log('find:', value, searchInput.value);
    pdf.mark(searchInput.value);
  }
});
</script>

<template>
  <div id="pdfObj">
    <div class="page-tool">
      <div class="page-tool-item" onclick="pdf.zoom(0.7)">整頁</div>
      <div class="page-tool-item" onclick="pdf.lastPage()">上一頁</div>
      <div id="pageShow" class="page-tool-item"></div>
      <div class="page-tool-item" onclick="pdf.nextPage()">下一頁</div>
      <div class="page-tool-item" onclick="pdf.zoomIn(0.2)">放大</div>
      <div class="page-tool-item" onclick="pdf.zoomOut(0.2)">缩小</div>
      <div class="page-tool-item">
        <input type="text" class="page-tool-input" placeholder="輸入內容" />
      </div>
    </div>
    <div id="pdfContainer"></div>
  </div>
</template>
<style>
#pdfObj {
  overflow-y: auto;
}

#pdfContainer {
  height: calc(100vh - 120px);
  overflow: auto;
}

.pdfContainer-highlight {
  background-color: rgb(239, 248, 0);
}

.pdfContainer-mark {
  background-color: rgb(255, 77, 77);
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
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  font-size: 1.6em;
  width: 100%;
}

.page-tool {
  top: 70px;
  position: fixed;
  padding-left: 12px;
  padding-right: 12px;
  display: flex;
  align-items: center;
  background: rgb(227, 227, 227);
  color: rgb(40, 40, 40);
  z-index: 1000;
  cursor: pointer;
  left: 85%;
  width: 620px;
  transform: translateX(-80%);
  user-select: none;
}

.page-tool-item {
  cursor: pointer;
  padding: 8px 15px;
  padding-left: 10px;
  transition: background-color 0.3s;
}

.page-tool-item:active {
  background-color: #ddd;
}

.page-tool-input {
  border: #ccc solid;
  background: none;
  outline: none;
  color: rgb(0, 0, 0);
}
</style>
