<script lang="ts" setup>
import TheMarkdown from '@/components/TheMarkdown.vue';
import TheVoiceInput from '@/components/TheVoiceInput.vue';
import { ACTOR_TYPE, GENERATE_QUESTION_TYPE, MQTT_TOPIC } from '@/enums';
import { useMqtt } from '@/hooks/useMqtt';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { createForm, getActors } from '@/services';
import type { Actor, ChoiceType, QAType } from '@/types';
import { get, set, useClipboard } from '@vueuse/core';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

const mqtt = useMqtt('guest_' + Math.random(), MQTT_TOPIC.CODE);
const actor = ref('exam');
const prompt = ref('西漢末年');
const mqttMsgLeftView = ref<string[]>([]); // 儲存給畫面左方的訊息 (處理前)
const mqttMsgRightView = ref<(ChoiceType | QAType)[]>([]); // 儲存給畫面右方的訊息 (處理前)
const mqttMsgRightViewTemp = ref<(ChoiceType | QAType)[]>([]); // mqtt 本次拋送的訊息
const messages = ref<{ type: string; message: string }[]>([]); // 畫面左方訊息 (處理後)
const markdownValue = ref(''); // 畫面右方訊息 (處理後)
const markdownValueTemp = ref(''); // mqtt 更新前的訊息
const assistantList = ref<string[]>(['高中歷史']);
const assistant = ref('高中歷史');
const knowledgePoint = ref('');
const numberOfChoiceQuestion = ref(1);
const numberOfAnswerQuestion = ref(1);
const { fire, Swal } = useSweetAlert();
const mqttLoading = ref(false);
const isVoiceInputWorking = ref(false);
const { copy } = useClipboard();
const ROLE_TYPE = {
  USER: 'user',
  AI: 'ai',
};
let _promptTemp: String = '';

const addMessage = (role: string, msg: string) => {
  messages.value.push({
    type: role,
    message: msg,
  });
};

const loadData = async () => {
  try {
    const { data }: { data: { list: Actor[] } } = await getActors();
    const assistants = data.list
      .filter((actor) => actor.type === ACTOR_TYPE.TUTORIAL)
      .map((actor) => actor.name);
    assistantList.value.push(...assistants);
  } catch (err: any) {
    fire({ title: '發生錯誤', text: err.message, icon: 'error' });
  }
};

const getPayload = () => {
  return JSON.stringify({
    assistant: get(assistant),
    topic: get(knowledgePoint),
    c_amt: get(numberOfChoiceQuestion),
    q_amt: get(numberOfAnswerQuestion),
    prompt: get(prompt),
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

    return [...choiceQuestions, ...qa, '<br><br>'].join('<br><br>');
  } catch (err: any) {
    console.warn(err);
    return '';
  }
};

/**
 * 處理 mqtt 訊息
 * @param msg {string | Object}
 */
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
  set(mqttLoading, true);
  mqttMsgLeftView.value.splice(0);
  mqtt.publish(`${get(actor)}:${getPayload()}`);
  addMessage(ROLE_TYPE.USER, get(prompt));
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
        text: result.value.url,
        confirmButtonText: '複製',
        preConfirm() {
          copy(result.value.url);
        },
      });
    }
  });
};

const onTrash = async () => {
  set(markdownValue, '');
  mqttMsgRightView.value.splice(0);
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

loadData();

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
  const info = handleMsg(msg);

  if (info instanceof Object) {
    if (info.loading) {
      return;
    }
    mqttMsgRightView.value.push(info);
    mqttMsgRightViewTemp.value.push(info);
    set(markdownValue, get(markdownValueTemp) + transformMsgToMarkdown(get(mqttMsgRightViewTemp)));
  }

  if (typeof info === 'string' && info.trim().length > 0) {
    mqttMsgLeftView.value.push(info);
  }

  if (isEnd) {
    set(mqttLoading, false);
    set(markdownValueTemp, get(markdownValue));
    get(mqttMsgLeftView).length && addMessage(ROLE_TYPE.AI, get(mqttMsgLeftView).join('\n'));
    mqttMsgRightViewTemp.value.splice(0);
  }
});
</script>

<template>
  <splitpanes class="default-theme">
    <pane min-size="20" size="20">
      <div class="d-flex flex-column h-100 left-panel overflow-auto">
        <v-card class="flex-shrink-0">
          <v-card-item prepend-icon="mdi-home">
            <v-card-subtitle>伴學小書僮</v-card-subtitle>
            <v-card-title>出題小書僮</v-card-title>
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
                  <v-select
                    label="出題範圍"
                    :items="assistantList"
                    variant="solo"
                    density="compact"
                    hide-details="auto"
                    v-model="assistant"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    label="題目知識點（用空白隔開）"
                    variant="solo"
                    density="compact"
                    hide-details="auto"
                    v-model="knowledgePoint"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    label="選擇題數量"
                    :items="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                    variant="solo"
                    density="compact"
                    hide-details="auto"
                    v-model="numberOfChoiceQuestion"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    label="問答題數量"
                    :items="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                    variant="solo"
                    density="compact"
                    hide-details="auto"
                    v-model="numberOfAnswerQuestion"
                  ></v-select>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-sheet>

        <v-divider></v-divider>

        <v-textarea
          class="mt-2 mx-7 flex-grow-0"
          rows="3"
          no-resize
          variant="solo"
          v-model="prompt"
          label="題目要求..."
          :disabled="mqttLoading || isVoiceInputWorking"
          :hint="mqttLoading ? '等待回覆中...' : ''"
          :loading="mqttLoading"
          clearable
        >
          <template v-slot:append-inner>
            <v-icon icon="mdi-chevron-right-box" size="x-large" @click="onSubmit"></v-icon>
          </template>
        </v-textarea>
        <div class="d-flex justify-center align-center flex-wrap">
          <TheVoiceInput @message="onVoiceMessage" @start="onVoiceStart" @stop="onVoiceStop" />
          <v-btn
            class="mb-4 text-orange ml-4"
            size="large"
            @click="onExport"
            :disabled="!mqttMsgRightView.length || mqttLoading"
          >
            匯出試卷
          </v-btn>
        </div>
      </div>
    </pane>
    <pane size="80">
      <v-card class="h-100 overflow-y-auto" max-height="calc(100vh - 64px)">
        <v-layout>
          <v-app-bar>
            <v-app-bar-title class="text-grey-darken-1 font-weight-bold">題目預覽</v-app-bar-title>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-trash-can-outline" @click="onTrash"></v-btn>
          </v-app-bar>

          <v-main>
            <TheMarkdown class="mx-8 my-6" :value="markdownValue" />
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
