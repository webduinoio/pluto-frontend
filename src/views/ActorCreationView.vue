<script lang="ts" setup>
import SvgSpinners3DotsBounce from '@/components/SvgSpinners3DotsBounce.vue';
import { ERROR_CODE, MQTT_TOPIC, RETURN_CODE_FROM_MQTT, ROUTER_NAME } from '@/enums';
import { useMessage } from '@/hooks/useMessage';
import { useMqtt } from '@/hooks/useMqtt';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { generateMqttUserId } from '@/hooks/useUtil';
import { createActor, deleteActor } from '@/services';
import { useActorStore } from '@/stores/actor';
import { set } from '@vueuse/core';
import axios from 'axios';
import { useField, useForm } from 'vee-validate';
import { useDisplay } from 'vuetify';

const actorStore = useActorStore();
const mqtt = useMqtt(generateMqttUserId(), '');
const router = useRouter();
const { xs } = useDisplay();
const { resetForm, handleSubmit } = useForm({
  initialValues: {
    name: '',
    url: '',
  },
  validationSchema: {
    name: 'required|max:50',
    url: 'required|url|google_drive|google_drive_valid',
  },
});

const debugMsg = ref(true);
const debugLog = (msg: any) => {
  if (debugMsg.value) {
    console.log(msg);
  }
};

const { fire } = useSweetAlert();
const { getErrorMessageForMqtt } = useMessage();
const name = useField('name', undefined, { label: '名稱' });
const url = useField('url', undefined, { label: '網址' });
const loadingDialog = ref(false);
const progressValue = ref(0);
const isSubmitting = ref(false); // 用於追蹤是否正在提交

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true; // 按下按鈕開始提交
  let actorID: number = 0;
  try {
    loadingDialog.value = true;
    let resp = await createActor(values);
    const actorUUID = resp['data']['data']['uuid'];
    actorID = resp.data.data.id;
    await mqtt.connect();
    const actorTrainResp = MQTT_TOPIC.PROC + '/' + actorUUID;
    mqtt.subscribe(actorTrainResp, async function (msg) {
      try {
        msg = JSON.parse(msg);
      } catch (e) {
        debugLog('old_msg:' + msg);
      }
      if (typeof msg != 'object') return;
      progressValue.value = msg['progress'];
      var rtnCode = msg['rtnCode'];
      if (rtnCode < 0) {
        // 避免後續再收到錯誤訊息
        await mqtt.disconnect();
        await deleteActor(actorID);

        switch (rtnCode) {
          case RETURN_CODE_FROM_MQTT.ERROR:
            await fire({
              title: '發生錯誤',
              icon: 'error',
              text: msg['msg'],
            });
            break;
          case RETURN_CODE_FROM_MQTT.TOO_MANY_PAGES_ERROR:
          case RETURN_CODE_FROM_MQTT.FILE_TOO_LARGE_ERROR:
            const errorMessageObject = getErrorMessageForMqtt(rtnCode);
            if (errorMessageObject) {
              // 刪除進度條
              set(loadingDialog, false);

              await fire({
                title: errorMessageObject.title,
                text: errorMessageObject.text,
              });
            }
            break;
        }
        router.push({ name: ROUTER_NAME.HOME });
      }
      if (progressValue.value >= 100) {
        resetForm();
        await mqtt.disconnect();
        setTimeout(() => {
          loadingDialog.value = false;
          progressValue.value = 0;
          actorStore.refreshActors = true;
          router.push({ name: ROUTER_NAME.STUDY_BUDDY_QA, params: { id: actorID } });
          isSubmitting.value = false; // 重置提交狀態
        }, 2000);
      }
    });
  } catch (err: any) {
    loadingDialog.value = false;
    if (axios.isAxiosError(err)) {
      console.error('error message: ', err.message);
      const code = err.response?.data.code;

      if (code === ERROR_CODE.VALIDATION_ERROR) {
        alert('網址不正確');
      } else if (code === ERROR_CODE.DUPLICATE_ERROR) {
        alert('名稱重複');
      } else if (code === ERROR_CODE.FOLDER_NOT_VIEWABLE_ERROR) {
        alert('資料夾權限不足');
      } else if (code === ERROR_CODE.TOO_MANY_ACTOR_ERROR) {
        alert('小書僮數量已滿');
      }
    } else {
      console.error('unexpected error: ', err);
    }
    isSubmitting.value = false; // 重置提交狀態
  }
});
</script>

<template>
  <v-container class="mb-6 h-100 d-flex flex-column align-center justify-center">
    <p class="text-h4 font-weight-bold">新增小書僮</p>
    <v-form @submit.prevent="onSubmit" class="mt-14">
      <v-sheet max-width="342" class="mx-auto bg-transparent">
        <v-row no-gutters>
          <v-col cols="12">
            <v-text-field
              label="小書僮名稱"
              v-model="name.value.value"
              variant="outlined"
              color="black"
              bg-color="white"
              :error-messages="name.errorMessage.value"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field
              label="Google 雲端資料網址"
              class="mt-2"
              variant="outlined"
              v-model="url.value.value"
              color="black"
              bg-color="white"
              :error-messages="url.errorMessage.value"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-sheet>

      <v-row class="mt-4">
        <v-col cols="12">
          <p v-if="xs" class="text-caption d-flex justify-center custom-text">
            請確保上傳的資料不涉及個人隱私或違反智慧財產權，<br />平台保留管理及刪除資料的權利
          </p>
          <p v-else class="text-caption d-flex justify-center custom-text">
            請確保上傳的資料不涉及個人隱私或違反智慧財產權，平台保留管理及刪除資料的權利
          </p>
        </v-col>
        <v-col cols="12">
          <div class="d-flex justify-center">
            <v-btn type="submit" color="primary" size="large" :disabled="isSubmitting">
              開始訓練
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-form>

    <!-- Loading dialog with progress circle -->
    <v-dialog v-model="loadingDialog" persistent max-width="600">
      <v-card>
        <v-card-text>
          <v-container class="d-flex align-end justify-center">
            <v-progress-circular
              :key="progressValue"
              :size="140"
              :width="30"
              color="primary"
              :model-value="progressValue"
            >
              <span class="text-h5">{{ Math.round(progressValue) }}%</span>
            </v-progress-circular>
          </v-container>
          <v-container class="d-flex align-end justify-center">
            <p class="text-h5">
              {{ progressValue >= 100 ? '訓練完成' : '訓練中' }}
            </p>
            <SvgSpinners3DotsBounce v-if="progressValue < 100" class="text-h5 ml-1" />
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style lang="scss" scoped>
.custom-text {
  text-align: center;
  color: #6d6d6d;
}
</style>
