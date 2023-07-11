<script lang="ts" setup>
import TheSheetTable from '@/components/TheSheetTable.vue';
import TheVoiceInput from '@/components/TheVoiceInput.vue';
import { MQTT_TOPIC } from '@/enums';
import { useMqtt } from '@/hooks/useMqtt';
import { generateMqttUserId } from '@/hooks/useUtil';
import { getGoogleSheetData } from '@/services/googleSheet';
import type { ChoiceType, QAType } from '@/types';
import { get, set, useDebounceFn } from '@vueuse/core';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

const mqtt = useMqtt(generateMqttUserId(), MQTT_TOPIC.CODE);
const actor = ref('sheet');
const prompt = ref('');
const mqttMsgLeftView = ref<string[]>([]); // 儲存給畫面左方的訊息 (處理前)
const mqttMsgRightView = ref<(ChoiceType | QAType)[]>([]); // 儲存給畫面右方的訊息 (處理前)
const wholeMsg = ref<string[]>([]); // 收到的所有 mqtt 訊息
const messages = ref<{ type: string; message: string }[]>([]); // 畫面左方訊息 (處理後)
const mqttLoading = ref(false);
const isVoiceInputWorking = ref(false);
const sheetUrl = ref('');
const sheetName = ref('');
const sheetValue = ref([]);
const loadingSheet = ref(false);
const messageScrollTarget = ref<HTMLFormElement>();
let _promptTemp: String = '';

const _loadSheetData = async () => {
  try {
    const result = await getGoogleSheetData({
      sheetUrl: get(sheetUrl),
      sheetName: get(sheetName),
      type: 'read_table',
    });
    set(sheetValue, result?.data);
  } catch (err) {
    console.error(err);
  }
};

const loadSheetData = useDebounceFn(async () => {
  set(loadingSheet, true);
  await _loadSheetData();
  set(loadingSheet, false);
}, 1000);

const getPayload = () => {
  return `${get(sheetName)} ${get(sheetUrl)} ${get(prompt)}`;
};

const handleMsg = (msg: string) => {
  try {
    const uuidReg = /\$UUID\$/gm;
    const rt = uuidReg.exec(msg);
    if (rt) {
      return msg.substring(0, rt.index).trim();
    }
    const json = JSON.parse(msg);
    return json;
  } catch (err) {
    return msg;
  }
};

const onSubmit = () => {
  if (!sheetValue.value.length) return;

  set(mqttLoading, true);
  mqttMsgLeftView.value.splice(0);
  mqttMsgRightView.value.splice(0);
  wholeMsg.value.splice(0);
  mqtt.publish(`${get(actor)}:${getPayload()}`);
  messages.value.push({
    type: 'user',
    message: get(prompt),
  });
};

const onSubmitByEnter = (evt: any) => {
  if (evt.shiftKey || evt.isComposing) return;
  onSubmit();
};

const onVoiceStart = () => {
  _promptTemp = get(prompt);
  set(isVoiceInputWorking, true);
};

const onVoiceStop = () => {
  set(isVoiceInputWorking, false);
};

const onVoiceMessage = async (value: string) => {
  set(prompt, _promptTemp + value);
};

const onRefresh = async () => {
  set(loadingSheet, true);
  loadSheetData();
};

watch(mqttLoading, (val) => {
  val && set(prompt, '');
});

/**
 * 處理讀取試算表
 */
watch(
  [sheetUrl, sheetName],
  ([url, name]) => {
    url && name && loadSheetData();
  },
  { immediate: true }
);

watch(
  messages,
  () => {
    nextTick(() => {
      if (messageScrollTarget.value) {
        messageScrollTarget.value.$el.querySelector('.v-sheet:last-child').scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }
    });
  },
  { deep: true }
);

/**
 * TODO: 待串接恢復，再調整顯示的內容
 * 思維工具的 mqtt，訊息格式與問答小書僮不一致
 * 訊息格式：
 * 1. json object
 * 2. 一般字串, e.g. 歡迎繼續提問 $UUID${{user id}}
 */
mqtt.init((msg: string, isEnd: boolean) => {
  if (!msg && !isEnd) return;

  wholeMsg.value.push(msg);
  const info = handleMsg(msg);
  if (info instanceof Object) {
    if (info.loading) {
      return;
    }
    mqttMsgRightView.value.push(info);
  } else {
    mqttMsgLeftView.value.push(info);
  }

  if (isEnd) {
    set(mqttLoading, false);
    messages.value.push({
      type: 'ai',
      message: mqttMsgLeftView.value.join('\n'),
    });
    // set(markdownValue, get(markdownValue) + transformMsgToMarkdown(get(mqttMsgRightView)));
  }
});
</script>

<template>
  <splitpanes class="default-theme">
    <pane min-size="30" size="30">
      <div class="d-flex flex-column h-100 left-panel">
        <v-card class="flex-shrink-0">
          <v-card-item prepend-icon="mdi-home">
            <v-card-subtitle>伴學小書僮</v-card-subtitle>
            <v-card-title>試算表小書僮</v-card-title>
          </v-card-item>
        </v-card>

        <v-divider></v-divider>

        <v-form class="ma-4">
          <v-select
            label="沒靈感嗎？點我選擇範例提示詞"
            :items="['待補充']"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            color="secondary"
          ></v-select>
        </v-form>

        <v-layout class="flex-grow-1 mx-2 overflow-y-auto" style="min-height: 100px">
          <div class="w-100">
            <v-container class="pa-2 pt-0" ref="messageScrollTarget">
              <v-sheet
                border
                rounded
                class="text-body-1 mx-auto mt-2"
                v-for="(msg, index) in messages"
                :color="msg.type === 'ai' ? 'grey-lighten-1' : ''"
                :key="index"
              >
                <v-container fluid>
                  <v-row>
                    <v-col cols="auto">
                      <v-icon :icon="msg.type === 'ai' ? 'mdi-robot' : 'mdi-account-box'"></v-icon>
                    </v-col>
                    <v-col>
                      <p v-html="msg.message?.replaceAll('\n', '<br>')"></p>
                    </v-col>
                  </v-row>
                </v-container>
              </v-sheet>
            </v-container>
          </div>
        </v-layout>

        <v-divider class="mt-2"></v-divider>

        <v-sheet class="ma-2 bg-transparent">
          <v-form @submit.prevent="onSubmit">
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    label="試算表連結"
                    variant="solo"
                    density="compact"
                    hide-details="auto"
                    v-model="sheetUrl"
                    clearable
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    label="工作表"
                    variant="solo"
                    density="compact"
                    hide-details="auto"
                    v-model="sheetName"
                    clearable
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-sheet>

        <v-divider></v-divider>

        <v-textarea
          class="mt-2 mx-7 flex-grow-0"
          rows="1"
          no-resize
          variant="solo"
          v-model="prompt"
          :disabled="mqttLoading || isVoiceInputWorking"
          :hint="mqttLoading ? '等待回覆中...' : ''"
          :loading="mqttLoading"
          clearable
          @keydown.enter="onSubmitByEnter"
        >
          <template v-slot:append-inner>
            <v-icon
              color="primary"
              icon="mdi-chevron-right-box"
              size="x-large"
              :style="{
                cursor: sheetValue.length && prompt ? 'pointer' : 'not-allowed',
                opacity: sheetValue.length && prompt ? 'unset' : '',
              }"
              @click="onSubmit"
            ></v-icon>
          </template>
        </v-textarea>
        <div class="d-flex justify-center align-center flex-wrap">
          <TheVoiceInput
            :disabled="mqttLoading"
            @message="onVoiceMessage"
            @start="onVoiceStart"
            @stop="onVoiceStop"
          />
        </div>
      </div>
    </pane>
    <pane size="80">
      <v-card class="h-100 overflow-y-auto" max-height="calc(100vh - 64px)">
        <v-layout class="h-100">
          <v-app-bar>
            <v-app-bar-title class="text-grey-darken-1 font-weight-bold">
              試算表內容
            </v-app-bar-title>
            <v-spacer></v-spacer>
            <v-btn prepend-icon="mdi-refresh" color="grey-darken-1" size="large" @click="onRefresh">
              重新整理
            </v-btn>
          </v-app-bar>
          <v-main class="d-flex flex-grow-1">
            <TheSheetTable :value="sheetValue" />
          </v-main>
        </v-layout>
        <v-overlay
          :model-value="loadingSheet"
          class="align-center justify-center"
          persistent
          contained
        >
          <v-progress-circular color="primary" indeterminate size="40"></v-progress-circular>
        </v-overlay>
      </v-card>
    </pane>
  </splitpanes>
</template>

<style lang="scss" scoped>
.left-panel {
  max-height: calc(100vh - 64px);
}

@keyframes micAnimation {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.mic-icon-working {
  animation-name: micAnimation;
  animation-duration: 0.8s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-play-state: running;
}
</style>
