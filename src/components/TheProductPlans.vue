<script setup lang="ts">
import { mdiCheck, mdiClose, mdiSchoolOutline } from '@mdi/js';

const onClick = () => {
  window.open('https://store.webduino.io/products/ai-tutor', '_blank');
};

const emit = defineEmits<{
  // 外層的 v-model 會直接綁定到元件的 root element
  // 再參考源碼 https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/components/VDialog/VDialog.tsx#L49
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>

<template>
  <v-dialog max-width="729px">
    <v-card class="rounded-lg" color="background">
      <template #append>
        <v-btn variant="text" :icon="mdiClose" @click="emit('update:modelValue', false)"></v-btn>
      </template>

      <div class="mx-16">
        <v-card-item class="pa-0">
          <v-card-title class="text-center text-h4 font-weight-bold">
            免費額度已到達上限囉！
          </v-card-title>
          <v-card-subtitle
            class="text-center text-subtitle-2 mt-3 font-weight-medium text-black"
            style="opacity: 1"
          >
            成為 PRO 加倍提升教學效率
          </v-card-subtitle>
        </v-card-item>

        <v-divider class="mx-6 my-3"></v-divider>

        <v-card-text>
          <v-row>
            <v-col class="d-flex justify-center justify-space-around align-end pa-0">
              <span class="text-h5 text-info font-weight-bold">免費版</span>
              <span class="text-info font-weight-bold" style="line-height: 1.7rem">NT$ 0 /月</span>
            </v-col>
            <v-col class="d-flex justify-center justify-space-around align-end pa-0">
              <span class="text-h5 text-secondary font-weight-bold"
                ><v-icon color="secondary" :icon="mdiSchoolOutline"></v-icon> PRO 版</span
              >
              <span class="text-secondary font-weight-bold" style="line-height: 1.7rem"
                >NT$ 3,000 /年</span
              >
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center justify-space-around">
            <v-card
              class="rounded-lg"
              width="250px"
              style="border: 1px solid lightgray; box-shadow: none"
            >
              <v-card-text class="ma-3">
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>2 支小書僮</strong>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>5 個檔案</strong>&nbsp;
                  <small>/每支小書僮</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>20 頁</strong>&nbsp;
                  <small>/每個檔案</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>20 MB</strong>&nbsp;
                  <small>/每個檔案</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>20 個問題數</strong>&nbsp;
                  <small>/每日</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>推薦問題</strong>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>參考資料</strong>
                </v-row>
                <v-row>
                  <v-icon :icon="mdiCheck" class="mr-1"></v-icon>
                  <strong>引用標籤</strong>
                </v-row>
              </v-card-text>
            </v-card>

            <v-card
              class="rounded-lg"
              width="250px"
              style="border: 1px solid lightgray; box-shadow: none"
            >
              <v-card-text class="ma-3">
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong class="text-secondary">10 支小書僮</strong>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong>10 個檔案</strong>&nbsp;
                  <small>/每支小書僮</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong class="text-secondary">500 頁</strong>&nbsp;
                  <small class="text-secondary font-weight-bold">/每個檔案</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong class="text-secondary">40 MB</strong>&nbsp;
                  <small class="text-secondary font-weight-bold">/每個檔案</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong class="text-secondary">300 個問題數</strong>&nbsp;
                  <small class="text-secondary font-weight-bold">/每日</small>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong>推薦問題</strong>
                </v-row>
                <v-row class="mb-1">
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong>參考資料</strong>
                </v-row>
                <v-row>
                  <v-icon :icon="mdiCheck" class="mr-1" color="secondary"></v-icon>
                  <strong>引用標籤</strong>
                </v-row>
              </v-card-text>
            </v-card>
          </v-row>

          <v-row class="mb-3 mt-3">
            <v-col class="d-flex justify-center align-center">
              <span class="text-secondary">目前方案</span>
            </v-col>
            <v-col class="d-flex justify-center align-center">
              <v-btn variant="flat" class="px-6" color="secondary" @click="onClick">
                成為 PRO
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </div>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
