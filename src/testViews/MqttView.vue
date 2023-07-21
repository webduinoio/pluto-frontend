<script lang="ts" setup>
import { useMqtt } from '@/hooks/useMqtt';
import { get, set } from '@vueuse/core';

const actor = '神鵰俠侶';
const text = ref('');
const msg1 = ref('');
const msg2 = ref('');
const uid = ref('');
const favor = ref('like');
const lastPrompt = ref('');

// 參考 webbit-gpt 裡的定義，而非 mqtt 實際的值
// https://github.com/marty5499/webbit-gpt/tree/aitsky
const wholeMsg = ref('');

const mqtt = useMqtt('guest_' + Math.random());

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
  } else {
    if (!msg) return;
    // 這裡會需要加換行，由於並非一次就完整送達的關係
    set(wholeMsg, get(wholeMsg) + '\n' + msg);
    set(msg1, get(msg1) + '\n' + msg);
  }
});

const onClick = function () {
  set(msg1, '');
  set(msg2, '');
  set(uid, '');
  set(wholeMsg, '');
  mqtt.publish(`${actor}:${text.value}`);
  set(lastPrompt, get(text));
};

/**
 * 根據 webbit-gpt 喜歡/不喜歡 的按鈕點擊
 */
const onClickResponse = () => {
  // 格式：[最後查詢的 prompt, 完整訊息, like | dislike, true | false]
  const info = [get(lastPrompt), get(wholeMsg), get(favor), get(favor) === 'like'];
  mqtt.publish(`feedback:${JSON.stringify(info)}`);
};
</script>

<template>
  <v-text-field label="prompt" v-model="text"></v-text-field>
  <v-btn @click="onClick"> 送出 </v-btn>
  <v-textarea label="簡易回覆" readonly v-model="msg1"></v-textarea>
  <v-textarea label="參考來源" readonly v-model="msg2" bg-color="#BDBDBD"></v-textarea>
  <v-textarea label="uuid" readonly v-model="uid"></v-textarea>
  <v-textarea label="完整訊息" readonly v-model="wholeMsg"></v-textarea>
  <v-radio-group v-model="favor">
    <v-radio label="like" value="like"></v-radio>
    <v-radio label="dislike" value="dislike"></v-radio>
  </v-radio-group>
  <v-btn @click="onClickResponse" :disabled="!text">送出回饋</v-btn>
</template>

<style lang="scss" scoped></style>
