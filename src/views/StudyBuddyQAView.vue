<script lang="ts" setup>
import ThePDFViewer from '@/components/ThePDFViewer.vue';
import TheVoiceInput from '@/components/TheVoiceInput.vue';
import { MQTT_TOPIC } from '@/enums';
import { useMqtt } from '@/hooks/useMqtt';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { generateMqttUserId } from '@/hooks/useUtil';
import { getActor } from '@/services';
import type { Actor } from '@/types/actors';
import { get, set } from '@vueuse/core';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

const route = useRoute();
const mqtt = useMqtt(generateMqttUserId(), MQTT_TOPIC.KN);
const actors = ref<{ type: string; messages: string[] }[]>([]);
const actorData = ref<Actor>();
const prompt = ref('');
const uid = ref('');
const referenceData = ref('');

const { fire } = useSweetAlert();
const mqttLoading = ref(false);
const isVoiceInputWorking = ref(false);
const messageScrollTarget = ref<HTMLFormElement>();
const hintSelect = ref('');
const hintItems = ref([
  { title: '條列重點', value: '用條列式列出[知識1]、[知識2]、[知識3]的重點。' },
  {
    title: '比較概念的異同',
    value: '分析並比較[知識1]和[知識2]的異同，回答包含：\n相同點\n相異點',
  },
  { title: '題目解析', value: '[你的題目和選項]\n盡可能詳細解釋為什麼這題答案是[正確選項]' },
]);
let _promptTemp: String = '';
let respMsg: string[] = [];

const loadData = async () => {
  const actorOpenID = route.params.id;

  try {
    const { data }: { data: Actor } = await getActor(Number(get(actorOpenID)));
    set(actorData, data);
  } catch (err: any) {
    fire({ title: '發生錯誤', text: err.message, icon: 'error' });
  }
};

const onSubmit = () => {
  if (!prompt.value) return;

  set(mqttLoading, true);
  set(uid, '');
  mqtt.publish(`${get(actorData)?.uuid}:${get(prompt)}`);
  actors.value.push({
    type: 'user',
    messages: [get(prompt)],
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

const onReferenceMessage = (endMsg: string) => {
  //set(referenceData, endMsg);
  var info: Array<object> = JSON.parse(endMsg);
  var links = '';
  var idxLink = 1;
  console.log(info);
  for (var i in info) {
    var idx = parseInt(i);
    var item = info[idx] as { score: number; content: string; url: string };
    if (idx > 0 && item.score < 0.8) continue;
    var content = item.content.split('\n');
    var keyword = '';
    for (var line in content) {
      console.log('line:[' + content[line] + ']');
      if (
        content[line].trim() != '' &&
        !content[line].trim().startsWith('#') &&
        !content[line].trim().startsWith('https://')
      ) {
        keyword = content[line];
        console.log('keyword:', keyword);
        break;
      }
    }
    let link = `((async function(){await pdf.load_and_find('${item.url}','${keyword}')})())`;
    links += `<a href="#" onclick="${link}">[${idxLink++}]</a> `;
  }
  return links;
};

loadData();

watch(mqttLoading, (val) => {
  val && set(prompt, '');
});

watch(hintSelect, (val) => {
  set(prompt, val);
});

watch(
  actors,
  () => {
    nextTick(() => {
      if (messageScrollTarget.value) {
        messageScrollTarget.value.$el.querySelector('.v-sheet:last-child').scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest',
        });
      }
    });
  },
  { deep: true }
);

mqtt.init((msg: string, isEnd: boolean) => {
  if (!msg || msg.trim().length === 0) return;
  if (isEnd) {
    // 其中包含 uuid 的部份，在這裡暫時無用
    const uuid = msg.split('\n\n$UUID$')[1];
    let endMsg = msg;
    if (uuid) {
      endMsg = msg.split('\n\n$UUID$')[0];
      set(uid, uuid);
    }
    respMsg.push(onReferenceMessage(endMsg));
    actors.value = [...actors.value];
    respMsg = [];
    set(mqttLoading, false);
  } else {
    if (respMsg.length == 0) {
      respMsg.push(msg);
      actors.value.push({
        type: 'ai',
        messages: respMsg,
      });
    } else {
      respMsg.push(msg);
      actors.value = [...actors.value];
    }
  }
});
</script>

<template>
  <splitpanes class="default-theme">
    <pane min-size="40" size="40">
      <div class="d-flex flex-column h-100 left-panel overflow-auto">
        <v-card class="flex-shrink-0">
          <v-card-item>
            <v-row fluid>
              <v-col cols="auto" class="image-container">
                <img class="rounded-image" width="47" height="47" :src="get(actorData)?.image" />
              </v-col>
              <v-col>
                <v-card-subtitle>問答小書僮</v-card-subtitle>
                <v-card-title>{{ actorData?.name }}</v-card-title>
              </v-col>
            </v-row>
          </v-card-item>
        </v-card>

        <v-divider></v-divider>

        <v-form class="ma-4">
          <v-select
            label="沒靈感嗎？點我選擇範例提示詞"
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

        <v-layout class="flex-grow-1 mx-2 overflow-y-auto" style="min-height: 100px">
          <div class="w-100">
            <v-container class="pa-2 pt-0" ref="messageScrollTarget">
              <div>
                <v-sheet
                  border
                  rounded
                  class="text-body-1 mx-auto mt-2"
                  v-for="(actor, index) in actors"
                  :color="actor.type === 'ai' ? 'grey-lighten-1' : ''"
                  :key="index"
                >
                  <v-container>
                    <v-row fluid v-for="(msg, msgIdx) in actor.messages" :key="msgIdx">
                      <v-col cols="auto">
                        <v-icon
                          :icon="
                            actor.type === 'ai'
                              ? msgIdx === 0
                                ? 'mdi-robot'
                                : ''
                              : 'mdi-account-box'
                          "
                        ></v-icon>
                      </v-col>
                      <v-col style="padding: 12px 12px 3px 12px">
                        <div v-html="msg"></div>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-sheet>
              </div>
            </v-container>
          </div>
        </v-layout>

        <v-divider class="mt-2"></v-divider>

        <v-textarea
          class="mt-2 mx-7 flex-grow-0"
          rows="3"
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
              icon="mdi-chevron-right-box"
              :style="{
                cursor: prompt ? 'pointer' : 'not-allowed',
                opacity: prompt ? 'unset' : '',
              }"
              size="x-large"
              @click="onSubmit"
            ></v-icon>
          </template>
        </v-textarea>
        <div class="d-flex flex-column align-center">
          <TheVoiceInput
            :disabled="mqttLoading"
            @message="onVoiceMessage"
            @start="onVoiceStart"
            @stop="onVoiceStop"
          />
        </div>
      </div>
    </pane>
    <pane size="60" class="h-100 right-panel">
      <v-card>
        <v-card-item>
          <v-card-title class="text-grey-darken-1 font-weight-bold">參考資料</v-card-title>
        </v-card-item>
      </v-card>
      <ThePDFViewer class="mx-8 my-6 custom-pdf-viewer" :value="referenceData" />
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
  max-height: 100vh;
  overflow-y: auto;
}
.custom-pdf-viewer {
  height: calc(100vh - 165px);
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rounded-image {
  border-radius: 50%;
  object-fit: cover;
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
