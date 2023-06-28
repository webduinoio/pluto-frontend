<script lang="ts" setup>
import TheMarkdown from '@/components/TheMarkdown.vue';
import { useMqtt } from '@/hooks/useMqtt';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { getActor } from '@/services';
import type { Actor } from '@/types/actors';
import { get, set, useSpeechRecognition, useStorage } from '@vueuse/core';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

// TODO: 暫定中文，後續再調整
const lang = ref('zh-TW');

const mqtt = useMqtt('guest_' + Math.random());
const messages = ref<{ type: string; message: string }[]>([]);
const actor = ref('');
const prompt = ref('');
const msg1 = ref('');
const msg2 = ref('');
const uid = ref('');
const wholeMsg = ref('');
const markdownValue = ref('');
const { fire } = useSweetAlert();
const speech = useSpeechRecognition({
  lang,
  continuous: true,
});
let _stop: Function | undefined;

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

const loadData = async () => {
  // TODO: 先暫時處理，後續再加入 pinia
  const actorOpenID = useStorage('actorOpenID', null, sessionStorage);

  try {
    const { data }: { data: Actor } = await getActor(Number(get(actorOpenID)));
    set(actor, data.name);
  } catch (err: any) {
    fire({ title: '發生錯誤', text: err.message, icon: 'error' });
  }
};

const onSubmit = () => {
  if (speech.isListening.value) {
    stopVoiceInput();
  }

  set(msg1, '');
  set(msg2, '');
  set(uid, '');
  set(wholeMsg, '');
  mqtt.publish(`${get(actor)}:${get(prompt)}`);
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
  // TODO: 待實作
  console.log('>>> export');
};

loadData();

mqtt.init((msg: string, isEnd: boolean) => {
  if (isEnd) {
    // 其中包含 uuid 的部份，在這裡暫時無用
    const uuid = msg.split('\n\n$UUID$')[1];
    let newMsg = msg;
    if (uuid) {
      newMsg = msg.split('\n\n$UUID$')[0];
      set(uid, uuid);
    }
    set(wholeMsg, get(wholeMsg) + newMsg);
    set(msg2, newMsg);

    set(markdownValue, newMsg);
    messages.value.push({
      type: 'ai',
      message: get(msg1),
    });
  } else {
    if (!msg) return;
    // 這裡會需要加換行，由於並非一次就完整送達的關係
    set(wholeMsg, get(wholeMsg) + '\n' + msg);
    get(msg1) ? set(msg1, get(msg1) + '\n' + msg) : set(msg1, msg);
  }
});
</script>

<template>
  <splitpanes class="default-theme">
    <pane min-size="20" size="20">
      <div class="d-flex flex-column h-100 left-panel">
        <v-card>
          <v-card-item prepend-icon="mdi-home">
            <v-card-subtitle>出題小書僮</v-card-subtitle>
            <v-card-title>{{ actor }}</v-card-title>
          </v-card-item>
        </v-card>

        <v-divider></v-divider>

        <v-form class="ma-4">
          <v-select
            label="沒靈感嗎？點我選擇範例提示詞"
            :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            color="orange"
          ></v-select>
        </v-form>

        <div class="flex-grow-1 ma-2 overflow-y-auto">
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
                  <p class="mb-4" v-html="msg.message?.replaceAll('\n', '<br>')"></p>
                </v-col>
              </v-row>
            </v-container>
          </v-sheet>
        </div>

        <v-divider></v-divider>

        <v-sheet class="ma-2 bg-grey-lighten-2">
          <v-form @submit.prevent="onSubmit">
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    label="出題範圍"
                    :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"
                    variant="solo"
                    density="compact"
                    hide-details="auto"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    label="題目知識點（用空白隔開）"
                    variant="solo"
                    density="compact"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    label="選擇題數量"
                    :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                    variant="solo"
                    density="compact"
                    hide-details="auto"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    label="問答題數量"
                    :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                    variant="solo"
                    density="compact"
                    hide-details="auto"
                  ></v-select>
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
          <v-btn class="mb-4 text-orange ml-4" size="large" @click="onExport"> 匯出試卷 </v-btn>
        </div>
      </div>
    </pane>
    <pane size="80">
      <v-card class="h-100 overflow-y-auto" max-height="calc(100vh - 64px)">
        <v-layout>
          <v-app-bar>
            <v-app-bar-title class="text-grey-darken-1 font-weight-bold">題目預覽</v-app-bar-title>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-trash-can-outline"></v-btn>
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
