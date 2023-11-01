<script lang="ts" setup>
import TheDislikeButton from '@/components/TheDislikeButton.vue';
import TheDislikeFeedback from '@/components/TheDislikeFeedback.vue';
import TheLikeButton from '@/components/TheLikeButton.vue';
import TheSheetTable from '@/components/TheSheetTable.vue';
import TheVoiceInput from '@/components/TheVoiceInput.vue';
import { MQTT_TOPIC } from '@/enums';
import { useMqtt } from '@/hooks/useMqtt';
import { generateMqttUserId } from '@/hooks/useUtil';
import { getGoogleSheetData } from '@/services/googleSheet';
import { createReview } from '@/services/history';
import type { ChoiceType, QAType } from '@/types';
import { mdiAccountBox, mdiChevronRightBox, mdiHome, mdiRefresh, mdiRobot } from '@mdi/js';
import { get, set, useDebounceFn, useInterval } from '@vueuse/core';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { useDisplay } from 'vuetify';

enum MessageType {
  USER = 'user',
  AI = 'ai',
}

interface Message {
  type: MessageType;
  message: string;
  error?: boolean;
  like?: boolean;
  id?: number;
}

const WIDTH_TO_SHOW_RIGHT_PANEL = 880;
const MQTT_LOADING_TIME = 60; // 超過 60 秒，就顯示錯誤訊息
const MQTT_FIRST_RESPONSE = 10; // 拋送問題，第一個回應超過 10 秒，顯示錯誤訊息
const mqtt = useMqtt(generateMqttUserId(), MQTT_TOPIC.CODE);
const actor = ref('sheet');
const prompt = ref('');
const mqttMsgLeftView = ref<string[]>([]); // 儲存給畫面左方的訊息 (處理前)
const mqttMsgRightView = ref<(ChoiceType | QAType)[]>([]); // 儲存給畫面右方的訊息 (處理前)
const wholeMsg = ref<string[]>([]); // 收到的所有 mqtt 訊息
const messages = ref<Message[]>([]); // 畫面左方訊息 (處理後)
const mqttLoading = ref(false);
const isVoiceInputWorking = ref(false);
const sheetUrl = ref('');
const sheetName = ref('工作表1');
const sheetValue = ref([]);
const loadingSheet = ref(false);
const messageScrollTarget = ref<HTMLFormElement>();
let _promptTemp: String = '';
const { width } = useDisplay();
const {
  counter: mqttLoadingTime,
  reset: mqttLoadingTimeReset,
  pause: mqttLoadingTimePause,
  resume: mqttLoadingTimeResume,
} = useInterval(1000, { controls: true, immediate: false });
const feedbackDialog = ref(false);
const feedbackIndex = ref(null);

const feedbackId = computed(() => {
  if (feedbackIndex.value === null) return;
  return messages.value[feedbackIndex.value].id;
});

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
    type: MessageType.USER,
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

const onClickLike = async (index: number) => {
  try {
    // 按鈕效果
    if (messages.value[index].like) {
      delete messages.value[index].like;
    } else {
      messages.value[index].like = true;
    }
    // 若有訊息 id，則送出結果
    if (messages.value[index].id) {
      const data: { id: number; like?: boolean } = {
        id: Number(messages.value[index].id),
      };
      if (messages.value[index].like !== undefined) {
        data.like = messages.value[index].like;
      }
      await createReview(data);
    }
  } catch (err) {
    console.error(err);
  }
};

const onClickDislike = (index: number) => {
  set(feedbackDialog, true);
  set(feedbackIndex, index);
};

const onSubmitDislike = () => {
  if (feedbackIndex.value === null) return;
  messages.value[feedbackIndex.value].like = false;
};

/**
 * 回答的角色必須是 ai 也不是錯誤訊息，才顯示讚/倒讚。
 * @param actorMsg
 */
const checkLikeVisibility = (message: Message) => {
  return message.type === MessageType.AI && !message.error;
};

const initMqtt = (msg: string, isEnd: boolean) => {
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
      type: MessageType.AI,
      message: mqttMsgLeftView.value.join('\n'),
    });
  }
};

const handleResponseId = (msg: string) => {
  try {
    const { id } = JSON.parse(msg);
    messages.value[messages.value.length - 1].id = Number(id);
  } catch (err) {
    console.error(err);
  }
};

watch(mqttLoadingTime, (val) => {
  if (
    (val > MQTT_FIRST_RESPONSE &&
      get(mqttMsgLeftView).length === 0 &&
      get(mqttMsgRightView).length === 0) ||
    val > MQTT_LOADING_TIME
  ) {
    messages.value.push({
      type: MessageType.AI,
      message: '我好像出了點問題，請重新整理畫面，或稍後再試一次！',
      error: true,
    });
    set(mqttLoading, false);
  }
});

watch(mqttLoading, (val) => {
  if (val) {
    mqttLoadingTimeResume();
  } else {
    mqttLoadingTimePause();
    mqttLoadingTimeReset();
  }

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
 * 思維工具的 mqtt，訊息格式與問答小助教不一致
 * 訊息格式：
 * 1. json object
 * 2. 一般字串, e.g. 歡迎繼續提問 $UUID${{user id}}
 */
mqtt.init(initMqtt, handleResponseId);
</script>

<template>
  <splitpanes
    class="default-theme"
    :class="{ 'custom-mobile-view': width < WIDTH_TO_SHOW_RIGHT_PANEL }"
  >
    <pane min-size="30" size="30">
      <v-container class="d-flex flex-column h-100 left-panel pa-0 overflow-auto" fluid>
        <v-card class="flex-shrink-0">
          <v-card-item :prepend-icon="mdiHome">
            <v-card-subtitle>伴學小助教</v-card-subtitle>
            <v-card-title>試算表小助教</v-card-title>
          </v-card-item>
        </v-card>

        <v-form class="ma-4">
          <v-select
            label="沒靈感嗎？點我使用 AI 推薦提問"
            :items="['待補充']"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            color="secondary"
          ></v-select>
        </v-form>

        <v-container class="pa-2 pt-0overflow-y-auto" fluid ref="messageScrollTarget">
          <v-sheet
            border
            rounded
            class="text-body-1 ma-2"
            v-for="(msg, index) in messages"
            :color="msg.error ? 'red-lighten-4' : msg.type === 'ai' ? 'grey-lighten-2' : ''"
            :key="index"
          >
            <v-container fluid>
              <v-row>
                <v-col cols="auto">
                  <v-icon :icon="msg.type === 'ai' ? mdiRobot : mdiAccountBox"></v-icon>
                </v-col>
                <v-col>
                  <p v-html="msg.message?.replaceAll('\n', '<br>')"></p>
                </v-col>
              </v-row>
              <div v-show="!mqttLoading">
                <div class="d-flex justify-end" v-if="checkLikeVisibility(msg)">
                  <TheLikeButton :model-value="msg.like" @click="onClickLike(index)" />
                  <TheDislikeButton
                    :model-value="msg.like === undefined ? undefined : !msg.like"
                    @click="onClickDislike(index)"
                  />
                </div>
              </div>
            </v-container>
          </v-sheet>
        </v-container>

        <v-spacer></v-spacer>

        <v-divider class="mt-2"></v-divider>

        <v-form @submit.prevent="onSubmit" class="ma-2">
          <v-container class="pa-2" fluid>
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

        <v-divider></v-divider>

        <v-textarea
          class="mt-2 mx-4 flex-grow-0"
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
              :icon="mdiChevronRightBox"
              size="x-large"
              :style="{
                cursor: sheetValue.length && prompt ? 'pointer' : 'not-allowed',
                opacity: sheetValue.length && prompt ? 'unset' : '',
              }"
              @click="onSubmit"
            ></v-icon>
          </template>
        </v-textarea>

        <v-container class="d-flex justify-center pa-0">
          <TheVoiceInput
            :disabled="mqttLoading"
            @message="onVoiceMessage"
            @start="onVoiceStart"
            @stop="onVoiceStop"
          />
        </v-container>
      </v-container>
    </pane>
    <pane size="80">
      <v-card class="h-100 overflow-y-auto" max-height="calc(100vh - 64px)">
        <v-layout class="h-100">
          <v-app-bar>
            <v-app-bar-title class="text-grey-darken-1 font-weight-bold">
              試算表內容
            </v-app-bar-title>
            <v-spacer></v-spacer>
            <v-btn :prepend-icon="mdiRefresh" color="grey-darken-1" size="large" @click="onRefresh">
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
  <TheDislikeFeedback
    v-model="feedbackDialog"
    @submit="onSubmitDislike"
    :feedback-id="feedbackId"
  ></TheDislikeFeedback>
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

.default-theme.custom-mobile-view {
  :deep(.splitpanes__splitter),
  :deep(.splitpanes__pane:last-child) {
    display: none;
  }

  :deep(.splitpanes__pane:first-child) {
    width: 100% !important;

    .v-row.custom-message:where(:has(.tooltip)) {
      display: none;
    }
  }
}
</style>
