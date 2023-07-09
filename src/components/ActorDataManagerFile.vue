<script setup lang="ts">
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { trainActor } from '@/services';
import { useMainStore } from '@/stores/main';
import { set } from '@vueuse/core';

const props = withDefaults(
  defineProps<{
    value: string;
  }>(),
  {}
);

// const emit = defineEmits<{
//   (e: 'create'): void;
//   (e: 'update'): void;
// }>();

const store = useMainStore();
const { fire } = useSweetAlert();
const training = ref(false);

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
</script>

<template>
  <v-window-item :value="props.value">
    <v-container>
      <v-row>
        <v-col cols="12" class="d-flex align-center">
          <div class="text-body-1 mr-2">
            請開啟雲端硬碟資料夾，更新訓練資料後，點擊再次訓練。
            <a
              href="https://docs.google.com/document/d/1faGhiXiscEq5UJhNYN1O0PUdPizCXv5sXAirfMe5qDc/edit?usp=sharing"
              target="_blank"
              class="text-primary"
              >訓練資料說明 <v-icon icon="mdi-open-in-new" size="x-small"></v-icon
            ></a>
          </div>
        </v-col>
      </v-row>
      <v-row align-content="center">
        <v-col cols="12" md="4">
          <div class="text-h6 font-weight-regular">Google 雲端硬碟資料夾</div>
        </v-col>
        <v-col>
          <v-btn
            color="secondary"
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
    </v-container>
  </v-window-item>
</template>

<style scoped></style>
