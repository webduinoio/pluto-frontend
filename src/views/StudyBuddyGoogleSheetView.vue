<script lang="ts" setup>
import { GENERATE_QUESTION_TYPE, MQTT_TOPIC } from '@/enums';
import { useMqtt } from '@/hooks/useMqtt';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { createForm } from '@/services';
import type { ChoiceType, QAType } from '@/types';
import { get, set, useSpeechRecognition } from '@vueuse/core';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

// TODO: 暫定中文，後續再調整
const lang = ref('zh-TW');

const mqtt = useMqtt('guest_' + Math.random(), MQTT_TOPIC.CODE);
const actor = ref('sheet');
const prompt = ref('');
const mqttMsgLeftView = ref<string[]>([]); // 儲存給畫面左方的訊息 (處理前)
const mqttMsgRightView = ref<(ChoiceType | QAType)[]>([]); // 儲存給畫面右方的訊息 (處理前)
const wholeMsg = ref<string[]>([]); // 收到的所有 mqtt 訊息
const messages = ref<{ type: string; message: string }[]>([]); // 畫面左方訊息 (處理後)
const markdownValue = ref(''); // 畫面右方訊息 (處理後)
const { fire, Swal } = useSweetAlert();
const speech = useSpeechRecognition({
  lang,
  continuous: true,
});
let _stop: Function | undefined;
const mqttLoading = ref(false);
const sheetUrl = ref(
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYNmM84kGT9jsa2dsZvrNCZCEWZVf6bUStil_SA3PauSGZY3wLrzUtsXVmr4ZKwcnEQ1s_2J-sw7dq/pubhtml?widget=true&amp;headers=false'
);

const startVoiceInput = () => {
  const recordPrompt = get(prompt);

  _stop = watch(speech.result, () => {
    set(prompt, recordPrompt + speech.result.value);
  });

  speech.result.value = '';
  speech.start();
};

const stopVoiceInput = () => {
  typeof _stop === 'function' && _stop();
  speech.stop();
};

const getPayload = () => {
  // return JSON.stringify({
  //   assistant: get(assistant),
  //   topic: get(knowledgePoint),
  //   c_amt: get(numberOfChoiceQuestion),
  //   q_amt: get(numberOfAnswerQuestion),
  //   prompt: get(prompt),
  // });
};

const onSubmit = () => {
  if (speech.isListening.value) {
    stopVoiceInput();
  }

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

const onVoiceInput = () => {
  if (!speech.isSupported.value) {
    fire({ title: '目前環境不支持語音輸入', text: '請更換設備，再試試。' });
    return;
  }
  if (speech.isListening.value) {
    stopVoiceInput();
    return;
  }
  startVoiceInput();
};

const onExport = async () => {
  fire({
    title: '試卷標題',
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off',
    },
    showCancelButton: true,
    showLoaderOnConfirm: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    reverseButtons: true,
    preConfirm: (title) => {
      return createForm({
        head: {
          title,
        },
        body: mqttMsgRightView.value,
      })
        ?.then((resp: any) => {
          return resp.data;
        })
        ?.catch((error) => {
          console.error(error);
          Swal.showValidationMessage(`發生錯誤`);
        });
    },
    allowOutsideClick: () => !Swal.isLoading(),
  }).then((result) => {
    if (result.value) {
      Swal.fire({
        title: '產生連結',
        text: result.value,
      });
    }
  });
};

const getChoiceText = (info: ChoiceType, orderNumber: number) => {
  const answerWords = ['A', 'B', 'C', 'D', 'E'];
  const { title, ans_idx, choices, comment } = info;
  return [
    `題目 ${orderNumber}：`,
    `問題：${title}`,
    `選項：`,
    ...choices.map((choice, idx) => `${answerWords[idx]}) ${choice}`),
    `答案：${answerWords[ans_idx]}`,
    `詳解：${comment}`,
  ].join('<br>');
};

const getQAText = (info: QAType, orderNumber: number) => {
  const { title, ans, comment } = info;
  return [`題目 ${orderNumber}：`, `問題：${title}`, `答案：${ans}`, `詳解：${comment}`].join(
    '<br>'
  );
};

const transformMsgToMarkdown = (info: (ChoiceType | QAType)[]) => {
  try {
    const choiceQuestions = info
      .filter((data: any) => data.type === GENERATE_QUESTION_TYPE.CHOICE)
      .map((val, idx) => getChoiceText(val as ChoiceType, idx + 1));

    const qa = info
      .filter((data: any) => data.type === GENERATE_QUESTION_TYPE.QA)
      .map((val, idx) => getQAText(val as QAType, idx + 1));

    return [...choiceQuestions, ...qa].join('<br><br>');
  } catch (err: any) {
    console.warn(err);
    return '';
  }
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

watch(mqttLoading, (val) => {
  val && set(prompt, '');
});

/**
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
    set(markdownValue, get(markdownValue) + transformMsgToMarkdown(get(mqttMsgRightView)));
  }
});
</script>

<template>
  <splitpanes class="default-theme">
    <pane min-size="20" size="20">
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
            color="orange"
          ></v-select>
        </v-form>

        <v-layout class="flex-grow-1 mx-2 overflow-y-auto" style="min-height: 100px">
          <v-container class="pa-2 pt-0">
            <v-sheet
              border
              rounded
              class="text-body-2 mx-auto mt-2"
              v-for="msg in messages"
              :color="msg.type === 'ai' ? 'grey-lighten-1' : ''"
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
        </v-layout>

        <v-divider class="mt-2"></v-divider>

        <v-sheet class="ma-2 bg-grey-lighten-2">
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
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    label="工作表"
                    variant="solo"
                    density="compact"
                    hide-details="auto"
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
          label="題目要求..."
          :disabled="mqttLoading"
          :hint="mqttLoading ? '等待回覆中...' : ''"
          :loading="mqttLoading"
        >
          <template v-slot:append-inner>
            <v-icon icon="mdi-chevron-right-box" size="x-large" @click="onSubmit"></v-icon>
          </template>
        </v-textarea>
        <div class="d-flex justify-center align-center flex-wrap">
          <v-btn class="mb-4 text-orange" size="large" @click="onVoiceInput">
            <template v-slot:prepend>
              <v-icon
                :class="{ 'mic-icon-working': speech.isListening.value }"
                :icon="
                  speech.isSupported.value
                    ? speech.isListening.value
                      ? 'mdi-microphone'
                      : 'mdi-microphone-outline'
                    : 'mdi-microphone-off'
                "
                color="orange"
                size="x-large"
              ></v-icon>
            </template>
            試試語音輸入
          </v-btn>
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
            <v-btn
              prepend-icon="mdi-refresh"
              color="grey-darken-1"
              size="large"
              @click="markdownValue = ''"
            >
              重新整理
            </v-btn>
          </v-app-bar>

          <v-main class="d-flex flex-grow-1">
            <iframe class="flex-grow-1 h-100" :src="sheetUrl"></iframe>
          </v-main>
        </v-layout>
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
