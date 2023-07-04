<script lang="ts" setup>
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { trainActor } from '@/services';
import { useMainStore } from '@/stores/main';
import { set } from '@vueuse/core';

const router = useRouter();
const store = useMainStore();
const { fire } = useSweetAlert();

const tab = ref();
const tab2 = ref();
const dialog = ref(false);
const editedItem = ref({
  question: 'sheng',
  answer: 'ok',
});
const training = ref(false);
const items = ref([
  {
    prependAvatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
    title: {
      question: '甄嬛的孩子叫什麼名字？',
      answer:
        '甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主...',
    },
  },
  {
    prependAvatar: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
    title: {
      question: '甄嬛的孩子叫什麼名字？',
      answer:
        '甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主...',
    },
  },
  {
    prependAvatar: 'https://cdn.vuetifyjs.com/images/lists/3.jpg',
    title: {
      question: '甄嬛的孩子叫什麼名字？',
      answer:
        '甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主...',
    },
  },
  {
    prependAvatar: 'https://cdn.vuetifyjs.com/images/lists/4.jpg',
    title: {
      question: '甄嬛的孩子叫什麼名字？',
      answer:
        '甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主...',
    },
  },
  {
    prependAvatar: 'https://cdn.vuetifyjs.com/images/lists/5.jpg',
    title: {
      question: '甄嬛的孩子叫什麼名字？',
      answer:
        '甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主...',
    },
  },
  {
    prependAvatar: 'https://cdn.vuetifyjs.com/images/lists/5.jpg',
    title: {
      question: '甄嬛的孩子叫什麼名字？',
      answer:
        '甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主...',
    },
  },
  {
    prependAvatar: 'https://cdn.vuetifyjs.com/images/lists/5.jpg',
    title: {
      question: '甄嬛的孩子叫什麼名字？',
      answer:
        '甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主。甄嬛的孩子是朧月公主...',
    },
  },
]);

const onBack = () => {
  router.push({
    name: 'Home',
  });
};

const onCreateClose = () => {
  set(dialog, false);
};

const onTrain = async () => {
  try {
    set(training, true);
    if (!store?.actorEditData?.id) {
      await fire({
        title: '發生錯誤',
        icon: 'error',
        text: `資料不存在 id: ${store?.actorEditData?.id}`,
      });
      return;
    }
    const {
      data: { code },
    } = await trainActor(store.actorEditData.id);

    if (code === 1) {
      await fire({
        title: '發生錯誤',
        icon: 'error',
        text: '伺服器發生錯誤，請詢問管理員進行處理。',
      });
      return;
    }
  } catch (err: any) {
    await fire({
      title: '發生錯誤',
      icon: 'error',
      text: err.message,
    });
  } finally {
    set(training, false);
  }
};
</script>

<template>
  <v-layout>
    <v-container class="mb-5">
      <v-breadcrumbs :items="[{ title: '返回', disabled: false, href: '#' }]" @click="onBack">
        <template v-slot:prepend>
          <v-icon icon="mdi-chevron-left"></v-icon>
        </template>
      </v-breadcrumbs>
      <v-main>
        <v-toolbar class="bg-grey-lighten-2">
          <v-toolbar-title class="text-h4 font-weight-bold">
            神鵰俠侶
            <v-btn icon="mdi-open-in-new" color="grey-darken-1"></v-btn>
          </v-toolbar-title>

          <template v-slot:extension>
            <v-tabs v-model="tab" class="text-grey" color="black">
              <v-tab class="text-h6" value="dataManager">資料管理</v-tab>
            </v-tabs>
          </template>
        </v-toolbar>
        <v-divider :thickness="2" class="divider"></v-divider>

        <v-window v-model="tab">
          <v-window-item value="dataManager">
            <v-tabs v-model="tab2" class="text-grey" color="black">
              <v-tab class="text-h6" value="file">檔案</v-tab>
              <v-tab class="text-h6" value="qa">Q & A</v-tab>
            </v-tabs>

            <v-window v-model="tab2">
              <v-window-item value="file">
                <v-container>
                  <v-row>
                    <v-col cols="12" class="d-flex align-center">
                      <div class="text-body-2 mr-2">
                        請開啟雲端硬碟資料夾，更新訓練資料後，點擊再次訓練。訓練資料說明
                      </div>
                      <v-btn
                        size="x-small"
                        density="compact"
                        icon="mdi-open-in-new"
                        variant="plain"
                        color="grey-darken-2"
                      ></v-btn>
                    </v-col>
                  </v-row>
                  <v-row align-content="center">
                    <v-col cols="12" md="4">
                      <div class="text-h6 font-weight-regular">Google 雲端硬碟資料夾</div>
                    </v-col>
                    <v-col>
                      <v-btn
                        color="orange"
                        variant="outlined"
                        size="large"
                        :href="store?.actorEditData?.url"
                        target="_blank"
                      >
                        開啟
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row align-content="center">
                    <v-col cols="12">
                      <v-btn color="#467974" class="text-white" size="large" @click="onTrain">
                        再次訓練
                      </v-btn>
                    </v-col>
                    <v-col cols="6">
                      <v-progress-linear
                        :active="training"
                        :indeterminate="training"
                        color="#467974"
                      ></v-progress-linear>
                    </v-col>
                  </v-row>
                </v-container>
              </v-window-item>
              <v-window-item value="qa">
                <v-container>
                  <v-toolbar class="bg-grey-lighten-2">
                    <v-spacer></v-spacer>
                    <v-responsive max-width="270">
                      <v-text-field
                        variant="solo"
                        label="Search text"
                        append-inner-icon="mdi-magnify"
                        density="comfortable"
                        single-line
                        hide-details
                        rounded
                        flat
                      ></v-text-field>
                    </v-responsive>
                    <v-dialog v-model="dialog" persistent max-width="500px">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          color="orange"
                          theme="dark"
                          variant="elevated"
                          class="ml-2 text-white"
                          v-bind="props"
                          size="large"
                          flat
                        >
                          新增 Q & A
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title class="mt-5 mx-5">
                          <span class="text-h5 font-weight-bold"> 新增 Q & A</span>
                        </v-card-title>

                        <v-card-text>
                          <div class="mx-4 text-body-1 text-grey-darken-2">
                            請輸入 Q & A 後，點擊再次訓練。
                          </div>
                          <v-container class="mt-10">
                            <v-row>
                              <v-col cols="12">
                                <v-textarea
                                  variant="outlined"
                                  label="Q:"
                                  rows="3"
                                  v-model="editedItem.question"
                                ></v-textarea>
                              </v-col>
                              <v-col cols="12">
                                <v-textarea
                                  variant="outlined"
                                  label="A:"
                                  rows="3"
                                  v-model="editedItem.answer"
                                ></v-textarea>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card-text>

                        <v-card-actions class="mb-4">
                          <v-spacer></v-spacer>
                          <v-btn
                            color="orange"
                            theme="dark"
                            variant="outlined"
                            class="text-white"
                            size="large"
                            flat
                            @click="onCreateClose"
                          >
                            取消
                          </v-btn>
                          <v-btn
                            color="orange"
                            theme="dark"
                            variant="elevated"
                            class="mr-5 text-white"
                            size="large"
                            flat
                          >
                            儲存
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    <!-- <v-dialog v-model="dialogDelete" max-width="500px">
                      <v-card>
                        <v-card-title class="text-h5"
                          >Are you sure you want to delete this item?</v-card-title
                        >
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="blue-darken-1" variant="text" @click="closeDelete"
                            >Cancel</v-btn
                          >
                          <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm"
                            >OK</v-btn
                          >
                          <v-spacer></v-spacer>
                        </v-card-actions>
                      </v-card>
                    </v-dialog> -->
                  </v-toolbar>

                  <v-list class="bg-grey-lighten-2" lines="two" max-height="460">
                    <template v-for="(item, idx) in items">
                      <v-list-item>
                        <template v-slot:prepend>
                          <p>{{ `#${idx + 1}` }}</p>
                        </template>
                        <v-list-item-title class="ml-4">
                          <div>Q: {{ item.title?.question }}</div>
                          <div class="text-truncate">
                            A:
                            {{ item.title?.answer }}
                          </div>
                        </v-list-item-title>
                        <template v-slot:append>
                          <v-btn icon="mdi-pencil" variant="text"></v-btn>
                          <v-btn icon="mdi-trash-can" variant="text"></v-btn>
                        </template>
                      </v-list-item>
                      <v-divider></v-divider>
                    </template>
                  </v-list>

                  <v-row align-content="center" class="mt-2">
                    <v-col cols="12">
                      <v-btn color="#467974" class="text-white" size="large">再次訓練</v-btn>
                    </v-col>
                    <v-col cols="6">
                      <v-progress-linear indeterminate color="#467974"></v-progress-linear>
                    </v-col>
                  </v-row>
                </v-container>
              </v-window-item>
            </v-window>
          </v-window-item>
        </v-window>
      </v-main>
    </v-container>
  </v-layout>
</template>

<style lang="scss">
.divider {
  position: relative;
  top: -2px;
}
</style>
