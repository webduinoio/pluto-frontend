<template>
  <div id="pdfObj">
    <div>
      <v-toolbar density="compact" :elevation="13">
        <span>
          <v-select
            density="compact"
            hide-details
            v-model="selectedItem"
            :items="items"
            return-object
            variant="outlined"
          >
            <template v-slot:selection="{ item }">
              <span style="width: 100%; font-size: 1em">
                {{ item.title }}
              </span>
            </template>
          </v-select>
        </span>
        <v-divider vertical length="25" style="margin-top: 15px"></v-divider>
        <v-btn :icon="mdiChevronLeft" @click="prevPage"></v-btn>
        <span style="width: 60px; margin: 5px">
          <v-text-field
            variant="solo-filled"
            density="compact"
            class="centered-input"
            v-model="currentPage"
            :max="totalPages"
            @keyup.enter="checkPageNumber"
          ></v-text-field>
        </span>
        <span style="width: 30px">/</span>
        <span style="width: 40px">{{ totalPages }}</span>
        <v-btn :icon="mdiChevronRight" @click="nextPage"></v-btn>
        <v-divider vertical length="25" style="margin-top: 15px"></v-divider>
        <v-btn :icon="mdiMinus" @click="adjustUI('-')"></v-btn>
        <span @click="fitSize" class="clickable">滿版</span>
        <v-btn :icon="mdiPlus" @click="adjustUI('+')"></v-btn>
        <v-divider vertical length="25" style="margin-top: 15px"></v-divider>
        <v-text-field
          v-model="searchText"
          clearable
          density="compact"
          variant="solo"
          label="全文檢索"
          :append-inner-icon="mdiMagnify"
          single-line
          rounded
          hide-details
          @keyup.enter="search"
          @click:append-inner="search"
          style="margin: 20px"
        >
        </v-text-field>
      </v-toolbar>
    </div>
    <div id="pdfContainer"></div>
  </div>
</template>

<script lang="ts" setup>
import { mdiChevronLeft, mdiChevronRight, mdiMagnify, mdiMinus, mdiPlus } from '@mdi/js';
import { ref } from 'vue';
import PDF from '../waPDF_ts.js';

declare global {
  interface Window {
    pdf: any;
  }
}
const pdf = new PDF();
const currentPage = ref(0);
const totalPages = ref(0);
const searchText = ref('');
const selectedItem = ref({ title: '參考文件' });
//const items = ref([{ title: '1.pdf' }, { title: '2.pdf' }, { title: 'Q&A.pdf' }]);
const items = ref([{ title: '參考文件' }]);

onMounted(() => {
  window.pdf = pdf;
  const ele = document.getElementById('pdfContainer');
  pdf.setViewElement(ele, currentPage, totalPages);
});
const search = () => {
  pdf.mark(searchText.value);
};
const fitSize = () => {
  pdf.zoom(-1);
};
const adjustUI = (operation: string) => {
  if (operation == '-') {
    pdf.zoomOut(0.2);
  } else if (operation == '+') {
    pdf.zoomIn(0.2);
  }
};
const prevPage = () => {
  pdf.lastPage(function (pageNum: number) {
    currentPage.value = pageNum;
  });
};
const nextPage = () => {
  pdf.nextPage(function (pageNum: number) {
    currentPage.value = pageNum;
  });
};
const checkPageNumber = () => {
  if (currentPage.value < 1 || currentPage.value > totalPages.value) {
    alert('Page number is out of range. Please enter a valid number.');
  } else {
    pdf.page(currentPage.value, function (pageNum: number) {
      currentPage.value = pageNum;
    });
  }
};
defineExpose({ pdf });
</script>

<style scoped>
::v-deep(.centered-select .v-select__selection) {
  text-align: center;
}

.centered-input {
  position: relative;
  top: 10px;
  width: 58px;
}

::v-deep(.centered-input input) {
  text-align: center;
}
::v-deep(.select-page-field) {
  width: 50px !important;
}
.clickable {
  cursor: pointer;
}
</style>

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
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  font-size: 1.6em;
  width: 100%;
}
</style>
