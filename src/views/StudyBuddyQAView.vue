<script lang="ts" setup>
import { get, useStorage } from '@vueuse/core';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

// TODO: 先暫時處理，後續再加入 pinia
const actorOpenID = useStorage('actorOpenID', null, sessionStorage);
console.log('>>> open id:', get(actorOpenID));

const messages = ref([
  {
    type: 'user',
    message: '123',
  },
  {
    type: 'ai',
    message: '4444',
  },
  {
    type: 'ai',
    message: '4444',
  },
  {
    type: 'ai',
    message: '4444',
  },
  {
    type: 'user',
    message: '123',
  },
]);

const text = ref(`123
  \n
  222
  22
`);

const onSubmit = () => {
  // TODO: 待實作
  console.log('>>> ok');
};
</script>

<template>
  <splitpanes class="default-theme">
    <pane min-size="20" size="20">
      <div class="d-flex flex-column h-100 left-panel">
        <v-card>
          <v-card-item prepend-icon="mdi-home">
            <v-card-subtitle class="">問答小書僮</v-card-subtitle>
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
        <v-textarea class="mt-2 mx-7 flex-grow-0" rows="1" no-resize variant="solo">
          <template v-slot:append-inner>
            <v-icon icon="mdi-chevron-right-box" size="x-large" @click="onSubmit"></v-icon>
          </template>
        </v-textarea>
        <div class="d-flex flex-column align-center">
          <v-btn class="mb-4 text-orange" size="large">
            <template v-slot:prepend>
              <v-icon
                icon="mdi-microphone-outline"
                color="orange"
                size="x-large"
                @click="onSubmit"
              ></v-icon>
            </template>
            試試語音輸入
          </v-btn>
        </div>
      </div>
    </pane>
    <pane size="80">5</pane>
  </splitpanes>
</template>

<style lang="scss" scoped>
.left-panel {
  max-height: calc(100vh - 64px);
  .flex-grow-1 {
    overflow-y: auto;
  }
}
</style>
