<script setup lang="ts">
import { NOTIFICATION_TIMEOUT } from '@/config';
import { ERROR_CODE, MQTT_TOPIC } from '@/enums';
import { useMqtt } from '@/hooks/useMqtt';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { generateMqttUserId } from '@/hooks/useUtil';
import { trainActor, validateUrl } from '@/services';
import type { Actor, Response } from '@/types';
import { mdiOpenInNew } from '@mdi/js';
import { set } from '@vueuse/core';
import { AxiosError } from 'axios';

const mqtt = useMqtt(generateMqttUserId(), '');
const progressValue = ref(0);
const props = withDefaults(
  defineProps<{
    value: string;
    actor: Actor | undefined;
  }>(),
  {}
);

const { fire } = useSweetAlert();
const training = ref(false);

// debug setup
const debugMsg = ref(true);

const debugLog = (msg: any) => {
  if (debugMsg.value) {
    console.log(msg);
  }
};

const onTrain = async () => {
  try {
    set(training, true);
    await mqtt.connect();
    const actorTrainResp = MQTT_TOPIC.PROC + '/' + props.actor?.uuid;
    mqtt.subscribe(actorTrainResp, async function (info) {
      try {
        info = JSON.parse(info);
      } catch (e) {
        console.log('oldMsg:', info);
      }
      progressValue.value = info['progress'];
      debugLog('info:' + JSON.stringify(info));
      if (info['code'] == 0 && info['progress'] == 100) {
        set(training, false);
        await fire({
          title: '訓練完成',
          icon: 'success',
          timer: NOTIFICATION_TIMEOUT,
          showConfirmButton: false,
        });
        progressValue.value = 0;
        await mqtt.disconnect();
      }
    });
    debugLog('mqtt connected.');
    if (!props.actor?.id) {
      await fire({
        title: '發生錯誤',
        icon: 'error',
        text: `資料不存在 id: ${props.actor?.id}`,
      });
      return;
    }

    await validateUrl(props.actor.url);
    const {
      data: { code },
    } = await trainActor(props.actor.id);
    if (code === ERROR_CODE.INTERNAL_SERVER_ERROR) {
      await fire({
        title: '發生錯誤',
        icon: 'error',
        text: '伺服器發生錯誤，請詢問管理員進行處理。',
      });
      return;
    }
  } catch (err: any) {
    let message = null;
    if (err instanceof AxiosError && err.response?.data) {
      const data = err.response.data as Response;
      if (data.code === ERROR_CODE.FOLDER_NOT_VIEWABLE_ERROR) {
        message = '資料夾權限未分享';
      } else if (data.code === ERROR_CODE.TOO_LARGE_ERROR) {
        message = '單一檔案超過 20 MB';
      } else if (data.code === ERROR_CODE.TOO_MANY_FILES_ERROR) {
        message = '檔案數量不能超過 5 個';
      } else {
        message = '伺服器發生錯誤，請詢問管理員進行處理。';
      }
    }

    await fire({
      title: '發生錯誤',
      icon: 'error',
      text: message || err.message,
    });
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
              >訓練資料說明 <v-icon :icon="mdiOpenInNew" size="x-small"></v-icon
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
            :href="props.actor?.url"
            target="_blank"
          >
            開啟
          </v-btn>
        </v-col>
      </v-row>
      <v-row align-content="center">
        <v-col cols="12">
          <v-btn color="primary" size="large" @click="onTrain" :disabled="training">
            {{ training ? '訓練中' : '再次訓練' }}
          </v-btn>
        </v-col>
        <v-col cols="6">
          <v-progress-linear
            :key="progressValue"
            :active="training"
            :model-value="progressValue"
            color="primary"
            :height="6"
            class="smooth-transition"
          ></v-progress-linear>
        </v-col>
      </v-row>
    </v-container>
  </v-window-item>
</template>

<style scoped>
.v-progress-linear__bar {
  transition: width 0.5s ease-out;
}
</style>
