<template>
  <div id="pdfObj">
    <div>
      <v-toolbar density="compact" :elevation="3">
        <span class="page-number-text">
          <v-select
            hide-details
            v-model="selectedItem"
            style="width: 300px"
            :items="items"
            item-text="title"
            return-object
            outlined
          >
            <template v-slot:selection="{ item }">
              <span class="d-flex justify-center" style="width: 100%; font-size: 1.3em">
                {{ item.title }}
              </span>
            </template>
          </v-select>
        </span>
        <v-divider vertical></v-divider>

        <v-btn :icon="mdiChevronLeft" @click="prevPage"></v-btn>
        <span class="page-number-text" style="width: 60px">
          <v-text-field
            variant="underlined"
            class="centered-input"
            v-model="currentPage"
            :max="totalPages"
          ></v-text-field>
        </span>
        <span class="page-number-text" style="width: 30px">/</span>
        <span class="page-number-text" style="width: 40px">{{ totalPages }}</span>
        <v-btn :icon="mdiChevronRight" @click="nextPage"></v-btn>
        <v-divider vertical></v-divider>
        <v-btn :icon="mdiMinus" @click="adjustUI('-')"></v-btn>
        <span @click="fitSize" class="clickable">滿版</span>
        <v-btn :icon="mdiPlus" @click="adjustUI('+')"></v-btn>
        <v-divider vertical></v-divider>
        <v-text-field
          v-model="searchText"
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
const totalPages = ref(200);
const currentPage = ref(1);
const searchText = ref('');
const selectedItem = ref({ title: '1.pdf' });
const items = ref([{ title: '1.pdf' }, { title: '2.pdf' }, { title: 'Q&A.pdf' }]);

onMounted(() => {
  window.pdf = pdf;
  const ele = document.getElementById('pdfContainer');
  pdf.setViewElement(ele, currentPage);
});

const search = () => {
  pdf.mark(searchText.value);
  searchText.value = '';
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
const selectItem = (item: { title: string }) => {
  selectedItem.value = item;
};
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    pdf.lastPage();
  }
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    pdf.nextPage();
  }
};
</script>

<style scoped>
::v-deep(.centered-select .v-select__selection) {
  text-align: center;
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
