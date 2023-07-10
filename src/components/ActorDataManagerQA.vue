<script setup lang="ts">
import DatasetForm from '@/components/DatasetForm.vue';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { getDatasets, trainActor } from '@/services';
import { deleteDataset } from '@/services/dataset';
import type { Actor, Dataset } from '@/types';
import { get, set } from '@vueuse/core';

const props = withDefaults(
  defineProps<{
    value: string;
    actor: Actor | undefined;
  }>(),
  {}
);

// const emit = defineEmits<{
//   (e: 'create'): void;
//   (e: 'update'): void;
// }>();

const { fire, confirm, showLoading, hideLoading } = useSweetAlert();

const training = ref(false);
const datasets = ref<Dataset[]>([]);
const search = ref('');
const loading = ref(false);

// TODO: 目前先支援載入 30 筆，後續需再調整
const loadDataset = async (options = {}) => {
  try {
    if (!props.actor?.id) {
      return;
    }
    const { data: value } = await getDatasets({ actorID: props.actor.id, ...options });
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
    if (!props.actor?.id) {
      await fire({
        title: '發生錯誤',
        icon: 'error',
        text: `資料不存在 id: ${props.actor?.id}`,
      });
      return;
    }
    const {
      data: { code },
    } = await trainActor(props.actor.id);

    if (code === 1) {
      await fire({
        title: '發生錯誤',
        icon: 'error',
        text: '伺服器發生錯誤，請詢問管理員進行處理。',
      });
      return;
    }

    await fire({
      title: '訓練完成',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    });
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
    await loadDataset();
  } catch (err) {
    console.error(err);
  } finally {
    set(loading, false);
  }
});
</script>

<template>
  <v-window-item :value="props.value">
    <v-container>
      <v-toolbar color="transparent">
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
        <DatasetForm title="新增 Q & A" :actorID="props.actor?.id" @create="loadDataset" />
      </v-toolbar>

      <v-list class="bg-transparent" lines="two" max-height="460">
        <template v-for="(item, idx) in datasets" :key="idx">
          <v-list-item>
            <template v-slot:prepend>
              <p>{{ `#${idx + 1}` }}</p>
            </template>
            <v-list-item-title class="ml-4">
              <div class="text-truncate">Q: {{ item.question }}</div>
              <div class="text-truncate">A: {{ item.answer }}</div>
            </v-list-item-title>
            <template v-slot:append>
              <DatasetForm title="編輯 Q & A" :edit-item="item" @update="loadDataset">
                <template #default="{ props }">
                  <v-btn icon="mdi-pencil" variant="text" v-bind="props"></v-btn>
                </template>
              </DatasetForm>
              <v-btn icon="mdi-trash-can" variant="text" @click="onDeleteDataset(item)"></v-btn>
            </template>
          </v-list-item>
          <v-divider></v-divider>
        </template>
      </v-list>

      <v-row align-content="center" class="mt-2">
        <v-col cols="12">
          <v-btn color="primary" size="large" @click="onTrain"> 再次訓練 </v-btn>
        </v-col>
        <v-col cols="6">
          <v-progress-linear
            :active="training"
            :indeterminate="training"
            color="primary"
          ></v-progress-linear>
        </v-col>
      </v-row>

      <v-overlay :model-value="loading" class="align-center justify-center" persistent contained>
        <v-progress-circular color="primary" indeterminate size="40"></v-progress-circular>
      </v-overlay>
    </v-container>
  </v-window-item>
</template>

<style scoped></style>
