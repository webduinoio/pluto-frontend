<script lang="ts" setup>
import DatasetForm from '@/components/DatasetForm.vue';
import { ACTOR_TYPE, ROUTER_NAME } from '@/enums';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { getDatasets, trainActor } from '@/services';
import { deleteDataset } from '@/services/dataset';
import { useMainStore } from '@/stores/main';
import type { Dataset } from '@/types';
import { get, set } from '@vueuse/core';

const router = useRouter();
const store = useMainStore();
const { fire, confirm, showLoading, hideLoading } = useSweetAlert();

const tab = ref();
const tab2 = ref();
const training = ref(false);
const datasets = ref<Dataset[]>([]);
const search = ref('');
const loading = ref(false);

// TODO: 目前先支援載入 30 筆，後續需再調整
const loadDataset = async (options = {}) => {
  try {
    if (!store?.actorEditData?.id) {
      return;
    }
    const { data: value } = await getDatasets({ actorID: store.actorEditData.id, ...options });
    set(datasets, value.list || []);
  } catch (err: any) {
    console.error(err);
    await fire({
      title: '發生錯誤',
      icon: 'error',
      text: err.message,
    });
  }
};

const onBack = () => {
  router.push({
    name: ROUTER_NAME.HOME,
  });
};

const onOpen = () => {
  if (!store?.actorEditData?.id) return;
  store.actorOpenID = store.actorEditData.id;
  if (store?.actorEditData?.type === ACTOR_TYPE.QUIZ) {
    router.push({
      name: ROUTER_NAME.STUDY_BUDDY_QUESTION,
    });
  } else {
    router.push({
      name: ROUTER_NAME.STUDY_BUDDY_QA,
    });
  }
};

const onDeleteDataset = async (data: Dataset) => {
  const isDoIt = await confirm({
    title: '刪除 Q & A',
    text: '確定刪除嗎？',
  });
  if (!isDoIt) return;

  try {
    showLoading();
    if (!data.id) return;
    await deleteDataset(data.id, data.actorId);
    await loadDataset();
  } catch (err: any) {
    console.error(err);
    fire({
      title: '刪除 Q & A 發生錯誤',
      icon: 'error',
      text: err.message,
    });
  } finally {
    hideLoading();
  }
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
    console.error(err);
    await fire({
      title: '發生錯誤',
      icon: 'error',
      text: err.message,
    });
  } finally {
    set(training, false);
  }
};

const onSearch = async () => {
  set(loading, true);
  await loadDataset({ search: get(search) });
  set(loading, false);
};

onMounted(async () => {
  try {
    set(loading, true);
    if (!store?.actorEditData?.id) {
      onBack();
      return;
    }

    await loadDataset();
  } catch (err) {
    console.error(err);
  } finally {
    set(loading, false);
  }
});
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
            {{ store?.actorEditData?.name }}
            <v-btn icon="mdi-open-in-new" color="grey-darken-1" @click="onOpen"></v-btn>
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
                        v-model="search"
                        @click:append-inner="onSearch"
                        :loading="loading"
                        :disabled="loading"
                      ></v-text-field>
                    </v-responsive>
                    <DatasetForm
                      title="新增 Q & A"
                      :actorID="store?.actorEditData?.id"
                      @create="loadDataset"
                    />
                  </v-toolbar>

                  <v-list class="bg-grey-lighten-2" lines="two" max-height="460">
                    <template v-for="(item, idx) in datasets">
                      <v-list-item>
                        <template v-slot:prepend>
                          <p>{{ `#${idx + 1}` }}</p>
                        </template>
                        <v-list-item-title class="ml-4">
                          <div>Q: {{ item.question }}</div>
                          <div class="text-truncate">
                            A:
                            {{ item.answer }}
                          </div>
                        </v-list-item-title>
                        <template v-slot:append>
                          <DatasetForm title="編輯 Q & A" :edit-item="item" @update="loadDataset">
                            <template #default="{ props }">
                              <v-btn icon="mdi-pencil" variant="text" v-bind="props"></v-btn>
                            </template>
                          </DatasetForm>
                          <v-btn
                            icon="mdi-trash-can"
                            variant="text"
                            @click="onDeleteDataset(item)"
                          ></v-btn>
                        </template>
                      </v-list-item>
                      <v-divider></v-divider>
                    </template>
                  </v-list>

                  <v-row align-content="center" class="mt-2">
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

                  <v-overlay
                    :model-value="loading"
                    class="align-center justify-center"
                    persistent
                    contained
                  >
                    <v-progress-circular
                      color="#467974"
                      indeterminate
                      size="40"
                    ></v-progress-circular>
                  </v-overlay>
                </v-container>
              </v-window-item>
            </v-window>
          </v-window-item>
        </v-window>
      </v-main>
    </v-container>
  </v-layout>
</template>

<style lang="scss" scoped>
.divider {
  position: relative;
  top: -2px;
}
</style>

<style lang="scss">
.swal2-container {
  z-index: 9999 !important;
}
</style>
