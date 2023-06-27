<script lang="ts" setup>
import TheMarkdown from '@/components/TheMarkdown.vue';
import { useMqtt } from '@/hooks/useMqtt';
import { get, set, useStorage } from '@vueuse/core';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

// TODO: 先暫時處理，後續再加入 pinia
const actorOpenID = useStorage('actorOpenID', null, sessionStorage);
console.log('>>> open id:', get(actorOpenID));

const mqtt = useMqtt('guest_' + Math.random());
const messages = ref<{ type: string; message: string }[]>([]);
const actor = '神鵰俠侶';
const prompt = ref('');
const msg1 = ref('');
const msg2 = ref('');
const uid = ref('');
const wholeMsg = ref('');
const markdownValue = ref('');

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

const onSubmit = () => {
  set(msg1, '');
  set(msg2, '');
  set(uid, '');
  set(wholeMsg, '');
  mqtt.publish(`${actor}:${get(prompt)}`);
  messages.value.push({
    type: 'user',
    message: get(prompt),
  });
};
</script>

<template>
  <splitpanes class="default-theme">
    <pane min-size="20" size="20">
      <div class="d-flex flex-column h-100 left-panel">
        <v-card>
          <v-card-item prepend-icon="mdi-home">
            <v-card-subtitle>問答小書僮</v-card-subtitle>
            <v-card-title>神鵰俠侶</v-card-title>
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
                  <p class="mb-4" v-html="msg.message.replaceAll('\n', '<br>')"></p>
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
          <v-btn class="mb-4 text-orange" size="large">
            <template v-slot:prepend>
              <v-icon icon="mdi-microphone-outline" color="orange" size="x-large"></v-icon>
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
</style>
