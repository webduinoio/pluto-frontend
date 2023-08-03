<template>
  <div id="pdfObj">
    <div>
      <v-toolbar density="compact" :elevation="3">
        <v-btn color="primary" style="min-width: 200px">
          {{ selectedItem.title }}
          <v-menu activator="parent" style="min-width: 200px">
            <v-list>
              <v-list-item v-for="(item, index) in items" :key="index" @click="selectItem(item)">
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-btn>
        <v-divider vertical></v-divider>

        <v-btn :icon="mdiChevronLeft" @click="prevPage"></v-btn>
        <v-text-field
          variant="underlined"
          class="centered-input"
          v-model="currentPage"
          :max="totalPages"
        ></v-text-field>
        <span class="page-number-text">/</span>
        <span class="page-number-text">{{ totalPages }}</span>
        <v-btn :icon="mdiChevronRight" @click="nextPage"></v-btn>
        <v-divider vertical></v-divider>
        <v-btn :icon="mdiMinus" @click="adjustUI('-')"></v-btn>
        <span @click="fitSize" class="clickable">滿版</span>
        <v-btn :icon="mdiPlus" @click="adjustUI('+')"></v-btn>
        <v-divider vertical></v-divider>

        <div class="search-container">
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
          >
          </v-text-field>
        </div>
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
  console.log(`search....${searchText.value}`);
  pdf.mark(searchText.value);
  searchText.value = '';
};
const fitSize = () => {
  console.log('fit size');
};
const adjustUI = (operation: string) => {
  if (operation == '-') {
    pdf.zoomOut(0.2);
  } else if (operation == '+') {
    pdf.zoomIn(0.2);
  }
  console.log(operation);
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
::v-deep(.centered-input input) {
  text-align: center;
}

.search-container {
  position: relative;
  width: 250px;
}

.search-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

::v-deep(.select-page-field) {
  width: 50px !important;
}

.clickable {
  cursor: pointer;
}

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
  top: 270px;
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
.custom-width {
  width: 100px !important;
}
</style>
