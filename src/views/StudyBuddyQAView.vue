<script lang="ts" setup>
import TheMarkdown from '@/components/TheMarkdown.vue';
import { MQTT_TOPIC } from '@/enums';
import { useMqtt } from '@/hooks/useMqtt';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { getActor } from '@/services';
import { useMainStore } from '@/stores/main';
import type { Actor } from '@/types/actors';
import { get, set, useSpeechRecognition } from '@vueuse/core';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

// TODO: 暫定中文，後續再調整
const lang = ref('zh-TW');

const store = useMainStore();
const mqtt = useMqtt('guest_' + Math.random(), MQTT_TOPIC.KN);
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
  const actorOpenID = store.actorOpenID;

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
            <v-card-subtitle>問答小書僮</v-card-subtitle>
            <v-card-title>{{ actor }}</v-card-title>
          </v-card-item>
        </v-card>
        <v-divider></v-divider>
        <div class="flex-grow-1 ma-2">
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
        <v-textarea
          class="mt-2 mx-7 flex-grow-0"
          rows="1"
          no-resize
          variant="solo"
          v-model="prompt"
        >
          <template v-slot:append-inner>
            <v-icon icon="mdi-chevron-right-box" size="x-large" @click="onSubmit"></v-icon>
          </template>
        </v-textarea>
        <div class="d-flex flex-column align-center">
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
      <div class="h-100 right-panel">
        <v-card>
          <v-card-item>
            <v-card-title class="text-grey-darken-1 font-weight-bold">參考資料</v-card-title>
          </v-card-item>
        </v-card>
        <TheMarkdown class="mx-8 my-6" :value="markdownValue" />
      </div>
    </pane>
  </splitpanes>
</template>

<style lang="scss" scoped>
.left-panel {
  max-height: calc(100vh - 64px);
  .flex-grow-1 {
    overflow-y: auto;
  }
}

.right-panel {
  max-height: calc(100vh - 64px);
  overflow-y: auto;
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
