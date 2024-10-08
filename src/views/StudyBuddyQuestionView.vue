<script lang="ts" setup>
import TheDislikeButton from '@/components/TheDislikeButton.vue';
import TheDislikeFeedback from '@/components/TheDislikeFeedback.vue';
import TheLikeButton from '@/components/TheLikeButton.vue';
import TheMarkdown from '@/components/TheMarkdown.vue';
import TheVoiceInput from '@/components/TheVoiceInput.vue';
import { ACTOR_TYPE, GENERATE_QUESTION_TYPE, MQTT_TOPIC } from '@/enums';
import { useMqtt } from '@/hooks/useMqtt';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { generateMqttUserId } from '@/hooks/useUtil';
import { createForm, getActors } from '@/services';
import { createReview } from '@/services/history';
import type { Actor, ChoiceType, QAType } from '@/types';
import { mdiAccountBox, mdiChevronRightBox, mdiHome, mdiRobot, mdiTrashCanOutline } from '@mdi/js';
import { get, set, useClipboard, useInterval } from '@vueuse/core';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { nextTick } from 'vue';
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
const MQTT_LOADING_TIME = 80; // 問答過程中，耗時超過 60 秒，顯示錯誤訊息
const MQTT_FIRST_RESPONSE = 30; // 拋送問題，第一個回應超過 10 秒，顯示錯誤訊息
const mqtt = useMqtt(generateMqttUserId(), MQTT_TOPIC.CODE);
const actor = ref('exam');
const prompt = ref('');
const mqttMsgLeftView = ref<string[]>([]); // 儲存給畫面左方的訊息 (處理前)
const mqttMsgRightView = ref<(ChoiceType | QAType)[]>([]); // 儲存給畫面右方的訊息 (處理前)
const mqttMsgRightViewTemp = ref<(ChoiceType | QAType)[]>([]); // mqtt 本次拋送的訊息
const messages = ref<Message[]>([]); // 畫面左方訊息 (處理後)
const markdownValue = ref(''); // 畫面右方訊息 (處理後)
const markdownValueTemp = ref(''); // mqtt 更新前的訊息
const assistantList = ref<Actor[]>([]);
const assistant = ref('');
const knowledgePoint = ref('');
const numberOfChoiceQuestion = ref(1);
const numberOfAnswerQuestion = ref(1);
const { fire, Swal } = useSweetAlert();
const mqttLoading = ref(false);
const isVoiceInputWorking = ref(false);
const messageScrollTarget = ref<HTMLFormElement>();
const markdownValueScrollTarget = ref<HTMLFormElement>();
const { copy } = useClipboard();
let _promptTemp: String = '';
const hintSelect = ref(null);
const hintItems = ref([
  { title: '按學生年級出題', value: '按照[年級]學生的程度出題' },
  {
    title: '批判性思考提問',
    value: '出開放性問題，題目沒有正確答案，要引導學生進行批判性思考',
  },
  { title: '5W1H 出題策略', value: '你會用5W1H策略出題' },
  { title: '是非題', value: '出是非題，選項是「是」或「否」' },
]);
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

const addMessage = (role: MessageType, msg: string, error: boolean = false) => {
  messages.value.push({
    type: role,
    message: msg,
    error,
  });
};

const loadData = async () => {
  try {
    const { data }: { data: { list: Actor[] } } = await getActors();
    assistantList.value.push(...data.list.filter((datum) => datum.type === ACTOR_TYPE.TUTORIAL));
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
  if (!assistant.value) return;
  set(mqttLoading, true);
  mqttMsgLeftView.value.splice(0);
  // 增加空白，就不會用 cache, e.g. mqtt.publish(`${get(actor)}: ${getPayload()}`);
  mqtt.publish(`${get(actor)}:${getPayload()}`);
  addMessage(MessageType.USER, get(prompt));
};

const onSubmitByEnter = (evt: any) => {
  if (evt.shiftKey || evt.isComposing) return;
  onSubmit();
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
  set(markdownValueTemp, '');
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
  return false;
  // return message.type === MessageType.AI && !message.error;
};

const initMqtt = (msg: string, isEnd: boolean) => {
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
    get(mqttMsgLeftView).length && addMessage(MessageType.AI, get(mqttMsgLeftView).join('\n'));
    mqttMsgRightViewTemp.value.splice(0);
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

loadData();

watch(mqttLoadingTime, (val) => {
  if (
    (val > MQTT_FIRST_RESPONSE &&
      get(mqttMsgLeftView).length === 0 &&
      get(mqttMsgRightViewTemp).length === 0) ||
    val > MQTT_LOADING_TIME
  ) {
    addMessage(MessageType.AI, '抱歉！我好像出了點問題，請重新整理畫面，或稍後再試一次！', true);
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
  if (val) {
    set(prompt, '');
    set(hintSelect, '');
  }
});

watch(hintSelect, (val) => {
  set(prompt, val);
});

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
      setTimeout(() => {
        if (markdownValueScrollTarget.value) {
          markdownValueScrollTarget.value.$el.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest',
          });
        }
      }, 1000);
    });
  },
  { deep: true }
);

/**
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
            <v-card-title>出題小助教</v-card-title>
          </v-card-item>
        </v-card>

        <v-form class="ma-4">
          <v-select
            label="沒靈感嗎？點我使用 AI 推薦提問"
            :items="hintItems"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            color="secondary"
            v-model="hintSelect"
          ></v-select>
        </v-form>

        <v-container
          class="pa-2 pt-0 overflow-y-auto"
          fluid
          ref="messageScrollTarget"
          style="min-height: 50px"
        >
          <v-sheet
            border
            rounded
            class="text-body-1 ma-2"
            v-for="(msg, index) in messages"
            :color="msg.error ? 'red-lighten-4' : msg.type === 'ai' ? 'grey-lighten-2' : ''"
            :key="`${index}-${msg.type}`"
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
                <v-select
                  label="出題範圍"
                  :items="assistantList"
                  item-title="name"
                  item-value="uuid"
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

        <v-divider></v-divider>

        <v-textarea
          class="mt-2 mx-4 flex-grow-0"
          rows="3"
          no-resize
          variant="solo"
          v-model="prompt"
          label="題目要求..."
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
              :style="{
                cursor: !assistant ? 'not-allowed' : 'pointer',
                opacity: !assistant ? '' : 'unset',
              }"
              size="x-large"
              @click="onSubmit"
            ></v-icon>
          </template>
        </v-textarea>

        <v-container class="d-flex justify-center pa-0 flex-wrap">
          <TheVoiceInput
            :disabled="mqttLoading"
            @message="onVoiceMessage"
            @start="onVoiceStart"
            @stop="onVoiceStop"
          />
          <v-btn
            class="mb-4 text-orange ml-4"
            size="large"
            @click="onExport"
            :disabled="!mqttMsgRightView.length || mqttLoading"
          >
            匯出試卷
          </v-btn>
        </v-container>
      </v-container>
    </pane>
    <pane size="80">
      <v-card class="h-100 overflow-y-auto" max-height="calc(100vh - 64px)">
        <v-layout ref="markdownValueScrollTarget">
          <v-app-bar>
            <v-app-bar-title class="text-grey-darken-1 font-weight-bold">題目預覽</v-app-bar-title>
            <v-spacer></v-spacer>
            <v-btn :icon="mdiTrashCanOutline" @click="onTrash"></v-btn>
          </v-app-bar>

          <v-main>
            <TheMarkdown class="mx-8 my-6" :value="markdownValue" />
          </v-main>
        </v-layout>
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
