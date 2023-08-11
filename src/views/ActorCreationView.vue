<script lang="ts" setup>
import { ERROR_CODE, MQTT_TOPIC, ROUTER_NAME } from '@/enums';
import { useMqtt } from '@/hooks/useMqtt';
import { generateMqttUserId } from '@/hooks/useUtil';
import { createActor } from '@/services';
import axios from 'axios';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';

const mqtt = useMqtt(generateMqttUserId(), '');
const router = useRouter();
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

const name = useField('name', undefined, { label: '名稱' });
const url = useField('url', undefined, { label: '網址' });
const loadingDialog = ref(false);
const progressValue = ref(0);

const onSubmit = handleSubmit(async (values) => {
  try {
    loadingDialog.value = true;
    let resp = await createActor(values);
    const actorUUID = resp['data']['data']['uuid'];
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
      if (progressValue.value >= 100) {
        resetForm();
        await mqtt.disconnect();
        setTimeout(() => {
          loadingDialog.value = false;
          progressValue.value = 0;
          router.push({ name: ROUTER_NAME.HOME });
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
      }
    } else {
      console.error('unexpected error: ', err);
    }
  }
});
</script>

<template>
  <v-container class="mb-6 h-100">
    <div class="h-100 d-flex justify-center align-center flex-column">
      <p class="text-h4">新增小書僮</p>
      <v-sheet width="342" class="mx-auto mt-14 bg-transparent">
        <v-form @submit.prevent="onSubmit">
          <v-text-field
            label="小書僮名稱"
            v-model="name.value.value"
            variant="outlined"
            color="black"
            bg-color="white"
            :error-messages="name.errorMessage.value"
          ></v-text-field>
          <v-text-field
            label="Google 雲端資料網址"
            class="mt-2"
            variant="outlined"
            v-model="url.value.value"
            color="black"
            bg-color="white"
            :error-messages="url.errorMessage.value"
          ></v-text-field>
          <div class="mt-16 d-flex justify-center">
            <v-btn type="submit" color="primary" size="large">開始訓練</v-btn>
          </div>
        </v-form>
      </v-sheet>

      <!-- Loading dialog with progress circle -->
      <v-dialog v-model="loadingDialog" persistent max-width="600px">
        <v-card>
          <v-card-text class="text-center">
            <v-progress-circular
              :key="progressValue"
              :size="140"
              :width="30"
              color="primary"
              :model-value="progressValue"
            >
              <span style="font-size: 1.5em">{{ Math.round(progressValue) }}%</span>
            </v-progress-circular>
            <p class="mt-4" style="fontsize: 1.5em">
              {{ progressValue >= 100 ? '訓練完成' : '訓練中...' }}
            </p>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<style lang="scss"></style>
