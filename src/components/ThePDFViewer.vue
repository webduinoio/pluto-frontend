<template>
  <div id="pdfObj">
    <div>
      <v-toolbar color="white" border elevation="5">
        <span style="width: 250px">
          <v-select
            density="compact"
            hide-details
            v-model="selectedItem"
            :items="items"
            return-object
            variant="solo"
            style="margin: 20px"
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
        <span style="width: 70px; margin: 5px">
          <v-text-field
            variant="outlined"
            density="compact"
            class="centered-input"
            v-model="currentPage"
            :max="totalPages"
            @keyup.enter="checkPageNumber"
          ></v-text-field>
        </span>
        <span style="width: 20px">/</span>
        <span style="width: 20px">{{ totalPages }}</span>
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
          style="margin: 30px"
        >
        </v-text-field>
      </v-toolbar>
    </div>
    <div id="pdfContainer"></div>
  </div>
</template>

<script lang="ts" setup>
import { MQTT_TOPIC } from '@/enums';
import { mdiChevronLeft, mdiChevronRight, mdiMagnify, mdiMinus, mdiPlus } from '@mdi/js';
import { onMounted, ref } from 'vue';
import PDF from '../waPDF_ts.js';

declare global {
  interface Window {
    pdf: any;
  }
}

const setSelectItem = (title: string) => {
  const matchedItem = props.items.find((item) => item.title === title);
  if (matchedItem) {
    selectedItem.value = matchedItem;
  } else {
    console.error(`Item with title ${title} not found in items.`);
  }
};

const pdf = new PDF(setSelectItem);
const currentPage = ref(1);
const totalPages = ref(0);
const searchText = ref('');
const selectedItem = ref({ title: '讀取中...', value: '' });

// 定義 props 和 emits
const props = defineProps<{
  items: Array<{ title: string; value: string }>;
}>();

// 使用 watch 来监听 items 的变化
watch(
  () => props.items,
  (newItems) => {
    if (newItems.length > 0) {
      selectedItem.value = newItems[0];
    }
  },
  { deep: true } // immediate 使得 watcher 在初始化时立即执行一次
);

watch(
  () => selectedItem.value,
  (newValue, oldValue) => {
    let hostname = MQTT_TOPIC.KN.replace('@chat', '').replace('@', '');
    let pdfHost = 'https://' + hostname + '.nodered.vip/books/docs/' + newValue.value;
    pdf.load(pdfHost, function () {
      if (pdf.pdfDoc && typeof pdf.pdfDoc.numPages === 'number') {
        totalPages.value = pdf.pdfDoc.numPages;
      }
    });
  }
);

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
  if (currentPage.value < 1) currentPage.value = 1;
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
  pdf.page(currentPage.value, function (pageNum: number) {
    currentPage.value = pageNum;
  });
};

// 暴露所需方法和屬性給 template
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
  height: calc(100vh - 130px);
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
