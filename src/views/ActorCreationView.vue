<script lang="ts" setup>
import { ERROR_CODE, MQTT_TOPIC, ROUTER_NAME } from '@/enums';
import { useMqtt } from '@/hooks/useMqtt';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { generateMqttUserId } from '@/hooks/useUtil';
import { createActor } from '@/services';
import axios from 'axios';
import { useField, useForm } from 'vee-validate';

const mqtt = useMqtt(generateMqttUserId(), '');

const router = useRouter();
const { fire, showLoading, hideLoading } = useSweetAlert();
const { resetForm, handleSubmit } = useForm({
  initialValues: {
    name: '',
    url: '',
  },
  // https://vee-validate.logaretm.com/v4/guide/global-validators/#available-rules
  validationSchema: {
    name: 'required|max:50',
    url: 'required|url|google_drive|google_drive_valid',
  },
});

// debug setup
const debugMsg = ref(true);
const debugLog = (msg: any) => {
  if (debugMsg.value) {
    console.log(msg);
  }
};

const name = useField('name', undefined, {
  label: '名稱',
});
const url = useField('url', undefined, {
  label: '網址',
});

// TODO: 待調整
const onSubmit = handleSubmit(async (values) => {
  try {
    showLoading();
    let resp = await createActor(values);
    const actorUUID = resp['data']['data']['uuid'];
    await mqtt.connect();
    const actorTrainResp = MQTT_TOPIC.PROC + '/' + actorUUID;
    mqtt.subscribe(actorTrainResp, async function (msg) {
      debugLog('msg:' + msg);
      if (msg.startsWith('true ')) {
        resetForm();
        await mqtt.disconnect();
        await fire({
          title: '建立完成',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        hideLoading();
        router.push({ name: ROUTER_NAME.HOME });
      }
    });
    debugLog('mqtt connected.');
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      console.error('error message: ', err.message);
      hideLoading();
      const code = err.response?.data.code;

      if (code === ERROR_CODE.VALIDATION_ERROR) {
        fire({
          title: '發生錯誤',
          icon: 'error',
          text: '網址不正確',
          showConfirmButton: false,
          timer: 1500,
        });
      } else if (code === ERROR_CODE.DUPLICATE_ERROR) {
        fire({
          title: '發生錯誤',
          icon: 'error',
          text: '名稱重複',
          showConfirmButton: false,
          timer: 1500,
        });
      } else if (code === ERROR_CODE.FOLDER_NOT_VIEWABLE_ERROR) {
        fire({
          title: '發生錯誤',
          icon: 'error',
          text: '資料夾權限不足',
          showConfirmButton: false,
          timer: 1500,
        });
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
    </div>
  </v-container>
</template>

<style lang="scss"></style>
