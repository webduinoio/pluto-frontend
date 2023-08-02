<script lang="ts" setup>
//import ThePDFViewer from '@/components/ThePDFViewer.vue';
import TheQAViewToolBar from '@/components/TheQAViewToolBar.vue';
import TheVoiceInput from '@/components/TheVoiceInput.vue';
import { ERROR_CODE, MQTT_TOPIC, ROUTER_NAME } from '@/enums';
import { useMqtt } from '@/hooks/useMqtt';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { generateMqttUserId } from '@/hooks/useUtil';
import { getActor } from '@/services';
import type { Actor } from '@/types/actors';
import { mdiAccountBox, mdiChevronRightBox } from '@mdi/js';
import { get, set } from '@vueuse/core';
import axios from 'axios';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

const route = useRoute();
const router = useRouter();
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
    if (axios.isAxiosError(err)) {
      const code = err.response?.data.code;

      if (code === ERROR_CODE.NOT_FOUND_ERROR) {
        await fire({ title: '沒有檢視權限', icon: 'warning' });
        router.push({ name: ROUTER_NAME.HOME });
        return;
      }
    }
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
  var info: Array<object> = JSON.parse(endMsg);
  var links = '<div style="text-align:left">';
  var idxLink = 1;
  var keywordAmt = 0;
  for (var i in info) {
    //console.log('reference:', info);
    var idx = parseInt(i);
    var item = info[idx] as { score: number; content: string; url: string };
    if (idx > 0 && item.score < 0.8) continue;
    var content = item.content.split('\n');
    var keyword = '';
    for (var line in content) {
      if (
        content[line].trim() != '' &&
        !content[line].trim().startsWith('#') &&
        !content[line].trim().startsWith('![圖片連結](https://')
      ) {
        keyword = content[line];
        break;
      }
    }
    if (keyword != '') {
      console.log('keyword:', keyword);
      var linkInfo = keyword;
      keywordAmt++;
      let link = `((async function(){await pdf.load_and_find('${item.url}','${keyword}')})())`;
      links += `<div class="tooltip">
  <a href="#" onclick="${link}">[${idxLink++}]</a>
  <span class="tooltiptext">${linkInfo}</span>
</div>`;
    }
  }
  links += '</div>';
  return keywordAmt == 0 ? '' : links;
};

onMounted(async () => {
  await loadData();
});

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
    var linkInfo = onReferenceMessage(endMsg);
    if (linkInfo != '') respMsg.push(linkInfo);
    actors.value = [...actors.value];
    respMsg = [];
    set(mqttLoading, false);
  } else {
    msg = msg.replace(
      /!\[.*?\]\((.*?)\)/g,
      "<img src='$1' width='50%' style='border-radius: 10px'>"
    );
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
                        <v-icon v-if="msgIdx !== 0"></v-icon>
                        <template v-else>
                          <v-icon v-if="actor.type !== 'ai'" :icon="mdiAccountBox"></v-icon>
                          <v-icon v-else>
                            <img class="icon-image" :src="get(actorData)?.image" />
                          </v-icon>
                        </template>
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
              :icon="mdiChevronRightBox"
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
      <!--
      <v-card>
        <v-card-item>
          <v-card-title class="text-grey-darken-1 font-weight-bold">參考資料</v-card-title>
        </v-card-item>
      <ThePDFViewer class="custom-pdf-viewer" :value="referenceData" />  
      </v-card>
      -->
      <TheQAViewToolBar :value="referenceData"></TheQAViewToolBar>
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
  height: calc(100vh - 165px);
}
.custom-pdf-viewer {
  height: calc(100vh - 120px);
  position: relative;
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
.icon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.mic-icon-working {
  animation-name: micAnimation;
  animation-duration: 0.8s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-play-state: running;
}
</style>

<style lang="scss">
/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
  cursor: pointer; /* If you want a pointer cursor on hover */
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;

  padding: 5px 0;
  border-radius: 6px;
  font-size: 0.8em;
  z-index: 1;
  /* Position the tooltip text */
  position: absolute;
  bottom: 100%; /* Place tooltip above the element */
  left: 50%;
  opacity: 0;
  transition: opacity 0.3s;
}

/* Show tooltip text on hover */
.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
</style>
