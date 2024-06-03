<script setup lang="ts">
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { mdiMicrophone, mdiMicrophoneOff, mdiMicrophoneOutline } from '@mdi/js';
import { useSpeechRecognition } from '@vueuse/core';

const props = withDefaults(
  defineProps<{
    text?: string;
    disabled?: boolean;
  }>(),
  {
    text: '試試語音輸入',
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: 'start'): void;
  (e: 'message', value: string): void;
  (e: 'stop'): void;
}>();

// TODO: 暫定中文，後續再調整
const lang = ref('zh-TW');

const { fire } = useSweetAlert();
const speech = useSpeechRecognition({
  lang,
  continuous: true,
});
let _stop: Function | undefined;

const startVoiceInput = () => {
  _stop = watch(speech.result, (val) => {
    // 回傳的值，是本次語音輸入的所有訊息
    emit('message', val);
  });

  speech.result.value = '';
  speech.start();
  emit('start');
};

const stopVoiceInput = () => {
  typeof _stop === 'function' && _stop();
  speech.stop();
  emit('stop');
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
</script>

<template>
  <v-btn
    v-if="!props.text"
    class="text-orange"
    :icon="
      speech.isSupported.value
        ? speech.isListening.value
          ? mdiMicrophone
          : mdiMicrophoneOutline
        : mdiMicrophoneOff
    "
    :disabled="props.disabled"
    @click="onVoiceInput"
  ></v-btn>
  <v-btn
    v-else
    class="mb-4 text-orange"
    size="large"
    :disabled="props.disabled"
    @click="onVoiceInput"
  >
    <template v-slot:prepend>
      <v-icon
        :class="{ 'mic-icon-working': speech.isListening.value }"
        :icon="
          speech.isSupported.value
            ? speech.isListening.value
              ? mdiMicrophone
              : mdiMicrophoneOutline
            : mdiMicrophoneOff
        "
        color="secondary"
        size="x-large"
      ></v-icon>
    </template>
    {{ props.text }}
  </v-btn>
</template>

<style scoped></style>
