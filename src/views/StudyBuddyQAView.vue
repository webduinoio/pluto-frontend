<script lang="ts" setup>
// Global function
function utf8ToB64(str: string) {
  return window.btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

import ThePDFViewer from '@/components/ThePDFViewer.vue';
import TheVoiceInput from '@/components/TheVoiceInput.vue';
import { ERROR_CODE, MQTT_TOPIC, ROUTER_NAME } from '@/enums';
import { getCookie } from '@/hooks/useCookie';
import { useMqtt } from '@/hooks/useMqtt';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { generateMqttUserId } from '@/hooks/useUtil';
import { getActor, getActorDocuments } from '@/services';
import { useAuthorizerStore } from '@/stores/authorizer';
import { useOAuthStore } from '@/stores/oauth';
import type { Actor } from '@/types/actors';
import {
  mdiAccountBox,
  mdiBookMultiple,
  mdiChevronRightBox,
  mdiThumbDown,
  mdiThumbUpOutline,
} from '@mdi/js';
import { get, set, useInterval } from '@vueuse/core';
import axios from 'axios';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { useDisplay } from 'vuetify';

type PDFItem = {
  title: string;
  value: string;
};

interface PDFViewerType {
  pdf: {
    setInjectAskPrompt: (callback: (ask: string) => void) => void;
  };
}

enum ActorMessageType {
  USER = 'user',
  AI = 'ai',
}

enum MessageType {
  PDF_LINK = 'pdf-link',
}

interface CustomMessage {
  type: MessageType;
  value: PdfLink[];
}

interface PdfLink {
  url: string;
  keyword: string;
  page: number;
  text: string | number;
  info: string;
}

interface ActorMessage {
  type: ActorMessageType;
  messages: (string | CustomMessage)[];
  error?: boolean;
}

const WIDTH_TO_SHOW_RIGHT_PANEL = 880; // 畫面寬度大於這個值才顯示 PDF Viewer
const MQTT_LOADING_TIME = 60; // 問答過程中，耗時超過 60 秒，顯示錯誤訊息
const MQTT_FIRST_RESPONSE = 10; // 拋送問題，第一個回應超過 10 秒，顯示錯誤訊息
const pdfViewerItems = ref<PDFItem[]>([]);
const route = useRoute();
const router = useRouter();
const mqtt = useMqtt(generateMqttUserId(), MQTT_TOPIC.KN);
const actors = ref<ActorMessage[]>([]);
const actorData = ref<Actor>();
const prompt = ref('');
const uid = ref('');
const pdfViewer = ref<PDFViewerType | null>(null);
const { fire } = useSweetAlert();
const mqttLoading = ref(false);
const isVoiceInputWorking = ref(false);
const messageScrollTarget = ref<HTMLFormElement>();
const textarea = ref<HTMLTextAreaElement>();
const hintSelect = ref(null);
const hintItems = ref([
  { title: '條列重點', value: '用條列式列出[知識1]、[知識2]、[知識3]的重點。' },
  {
    title: '比較概念的異同',
    value: '分析並比較[知識1]和[知識2]的異同，回答包含：\n相同點\n相異點',
  },
  { title: '題目解析', value: '[你的題目和選項]\n盡可能詳細解釋為什麼這題答案是[正確選項]' },
]);
let _promptTemp: String = '';
let respMsg: (string | CustomMessage)[] = [];
const authorizer = useAuthorizerStore();
const oauth = useOAuthStore();
const user = oauth.user;
const { width } = useDisplay();
const {
  counter: mqttLoadingTime,
  reset: mqttLoadingTimeReset,
  pause: mqttLoadingTimePause,
  resume: mqttLoadingTimeResume,
} = useInterval(1000, { controls: true, immediate: false });

const loadData = async () => {
  const actorOpenID = route.params.id;
  try {
    const { data: actor }: { data: Actor } = await getActor(Number(get(actorOpenID)));
    set(actorData, actor);

    if (actor.recommends.length !== 0) {
      hintItems.value = actor.recommends.map((recommend) => {
        return {
          title: recommend.name,
          value: recommend.name,
        };
      });
    }

    const {
      data: { data },
    } = await getActorDocuments(actor.id);
    let folderId = actor.url.substring(actor.url.indexOf('/folders/') + 9);
    folderId = folderId.replace('?usp=sharing', '').replace('?usp=drive_link', '');

    for (var i in data) {
      if (data[i].endsWith('.doc') || data[i].endsWith('.pdf')) {
        data[i] = data[i].substring(0, data[i].length - 4);
      } else if (data[i].endsWith('.docx')) {
        data[i] = data[i].substring(0, data[i].length - 5);
      }
      var link = {
        ns: folderId,
        file: data[i] + '.pdf',
      };
      var encodedString = utf8ToB64(JSON.stringify(link));
      var showFilename = data[i];
      pdfViewerItems.value.push({ title: showFilename, value: encodedString });
    }
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
  mqtt.publish(
    JSON.stringify({
      token: getCookie('oauth_access_token'),
      actorId: get(actorData)?.uuid,
      payload: get(prompt),
    })
  );
  actors.value.push({
    type: ActorMessageType.USER,
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

// TODO: 後續可調整，單純處理資料，最後顯示的內容交由 template 來處理。
const onReferenceMessage = (endMsg: string): PdfLink[] => {
  var info: Array<object> = JSON.parse(endMsg);
  var links =
    '<div style="text-align:left"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAhGVYSWZNTQAqAAAACAAFARIAAwAAAAEAAQAAARoABQAAAAEAAABKARsABQAAAAEAAABSASgAAwAAAAEAAgAAh2kABAAAAAEAAABaAAAAAAAAAEgAAAABAAAASAAAAAEAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAGKADAAQAAAABAAAAGAAAAAARDxiuAAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgoZXuEHAAACLUlEQVRIDaXVTW4TQRAFYJtAAggCQigsEAdgBSfhJJDDRLkI5wCxisSSTZAQCxBB4idg4H2NKzT22J7Ak95Md3V1/XbPTCfLmEb0M7wU3ghnIdkY2LcVfgi/hdPFjRYZfBQehldCm8aC7oXwS/g4fBo2MLw9H4v8dUj5f3ic/du8gahP22gyuZW3yIHM2ljQ/TpX3sl792IeysSoyN+ElH6EQAbvQ7LqD9kiBHszZBPoz0x2w+ehqO+F30MlAwYZfxC+DUVVzjNsYFjUe+GL8HYI9k45oGDxKkE4BEZ79nr6ZM17CRxY0PXqR69ko7RfhoMGOmVOr4VKXBU4qxfjQw4iblkpzRj0mTX9asiqzZzqwf1QDxzlxUzoqMCd8CisHmT4p+NtsuYhg8vhkIPqo0Ny7gzG9MAnQVYycSIHexD5P0HEDkGPv0o4tgcPY6G/B6Kts/8sY8dcJnUxM/yNTQ5KT9roEooQjck4g6X6Ew45KAPWN/WAUWcfBm0NCV2SioYDEV4PV4FOX/cas7FV6dlsgcN34ecQzHudJlx4WO9ZfXA3TvoM1NNZ/hTuhwfzOceVUYZrwQZdxp+EpyaO2avQJXILK/oM22e8NplvgoCVWBXaL7MvgVPhv2DRl5Wjj+HY6GXKaIGjmc1qJoO74UlYZeubHfFKaLJPiXvivvhpqUb7QzLGqx/0YejIWeC4fqEZrgUHyijjysC8gSGUnkwcRxvOCzbsUwG2zvALNZiPb44hnCMAAAAASUVORK5CYII=" style="width:16px;position:relative;top:3px">';
  var idxLink = 1;
  var keywordAmt = 0;
  const pdfLinks: PdfLink[] = [];
  for (var i in info) {
    var idx = parseInt(i);
    var item = info[idx] as { score: number; content: string; url: string; page: number };
    if (idx > 0 && item.score < 0.7) continue;
    var content = item.content.split('\n');
    var keyword = '';
    for (var line in content) {
      if (
        content[line].trim() != '' &&
        !content[line].trim().startsWith('#') &&
        !content[line].trim().startsWith('圖片連結](https://')
      ) {
        // 這邊可以處理 jieba
        keyword = content[line];
        break;
      }
    }

    if (keyword != '') {
      //console.log('index:', keyword);
      var linkInfo;
      if (/[\u4e00-\u9fff]/.test(keyword)) {
        // 如果包含中文字符
        linkInfo = keyword.length > 7 ? keyword.substring(0, 7) + '...' : keyword;
        keyword = keyword.split(' ')[0];
      } else {
        // 如果是英文
        var words = keyword.split(' ');
        if (words.length > 7) {
          keyword = words.slice(0, 7).join(' ');
          linkInfo = keyword + '...';
        } else {
          linkInfo = keyword;
        }
      }
      keywordAmt++;
      pdfLinks.push({
        url: item.url,
        keyword: keyword,
        page: item.page,
        text: idxLink++,
        info: linkInfo,
      });
    }
  }

  return pdfLinks;
};

const onClickPdfLink = async (link: { url: string; keyword: string; page: number }) => {
  await pdf.load_and_find(link.url, link.keyword, link.page);
};

const onEdit = () => {
  window.open(
    router.resolve({
      name: ROUTER_NAME.ACTOR_EDIT,
      params: { id: actorData.value?.id },
    }).href,
    '_blank'
  );
};

/**
 * 回答的角色必須是 ai 且沒有 pdf link 才顯示。
 * 有 pdf link 時，會有另外的顯示方式。
 * @param actorMsg
 */
const checkLikeVisibility = (actorMsg: ActorMessage) => {
  const isHasPdfLink = actorMsg.messages.some((msg) => {
    return typeof msg === 'object' && msg.type === MessageType.PDF_LINK;
  });
  return actorMsg.type === ActorMessageType.AI && !isHasPdfLink;
};

const onClickLike = () => {
  console.log('like');
};

const onClickUnLike = () => {
  console.log('Unlike');
};

onMounted(async () => {
  await loadData();
  pdfViewer.value?.pdf.setInjectAskPrompt(function (ask: string) {
    set(prompt, ask);
  });
});

watch(mqttLoadingTime, (val) => {
  // 由於 respMsg 並非 ref 物件，因此在執行順序上，不必擔心。
  if ((val > MQTT_FIRST_RESPONSE && respMsg.length === 0) || val > MQTT_LOADING_TIME) {
    actors.value.push({
      type: ActorMessageType.AI,
      messages: ['我好像出了點問題，請重新整理畫面，或稍後再試一次！'],
      error: true,
    });
    set(mqttLoading, false);
  }
});

watch(mqttLoading, async (val) => {
  if (val) {
    mqttLoadingTimeResume();
  } else {
    mqttLoadingTimePause();
    mqttLoadingTimeReset();
  }

  val && set(prompt, '');
  await nextTick();
  textarea.value && textarea.value.focus();
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
    const linkInfo = onReferenceMessage(endMsg);
    if (linkInfo.length > 0) {
      respMsg.push({
        type: MessageType.PDF_LINK,
        value: linkInfo,
      });
    }
    respMsg = [];
    set(mqttLoading, false);
  } else {
    msg = msg.replace(
      /(!?)\[.*?\]\((.*?)\)/g,
      "<img src='$2' width='50%' style='border-radius: 10px'>"
    );
    if (respMsg.length === 0) {
      respMsg.push(msg);
      // 這裡的 respMsg 是傳址而非傳值，後續理解上要注意。
      actors.value.push({
        type: ActorMessageType.AI,
        messages: respMsg,
      });
    } else {
      respMsg.push(msg);
    }
  }
});
</script>

<template>
  <splitpanes
    class="default-theme"
    :class="{ 'custom-mobile-view': width < WIDTH_TO_SHOW_RIGHT_PANEL }"
  >
    <pane min-size="40" size="40">
      <v-container class="d-flex flex-column h-100 left-panel pa-0 overflow-auto" fluid>
        <v-card class="flex-shrink-0">
          <v-card-item>
            <v-row fluid>
              <v-col cols="auto" class="image-container">
                <v-img class="rounded-image" width="47" height="47" :src="get(actorData)?.image" />
              </v-col>
              <v-col>
                <v-card-subtitle>問答小助教</v-card-subtitle>
                <v-card-title>{{ actorData?.name }}</v-card-title>
              </v-col>
              <v-col
                v-if="
                  actorData?.createdBy === user?.id ? authorizer.canEdit : authorizer.canEditAll
                "
                class="d-flex align-start justify-end"
              >
                <v-btn variant="text" color="primary" @click="onEdit">編輯</v-btn>
              </v-col>
            </v-row>
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
          >
            <template v-slot:selection="{ item }">
              <span class="text-truncate">
                {{ item.title }}
              </span>
            </template>
          </v-select>
        </v-form>

        <v-container class="pa-2 pt-0 w-100 overflow-y-auto" fluid ref="messageScrollTarget">
          <v-sheet
            border
            rounded
            class="text-body-1 mx-auto mt-2"
            v-for="(actor, index) in actors"
            :color="
              actor.error
                ? 'red-lighten-4'
                : actor.type === ActorMessageType.AI
                ? 'grey-lighten-2'
                : ''
            "
            :key="index"
          >
            <v-container fluid>
              <v-row
                fluid
                v-for="(msg, msgIdx) in actor.messages"
                :key="msgIdx"
                class="custom-message"
              >
                <v-col cols="auto">
                  <template v-if="msgIdx === 0">
                    <v-icon
                      v-if="actor.type !== ActorMessageType.AI"
                      :icon="mdiAccountBox"
                    ></v-icon>
                    <v-icon v-else>
                      <img class="icon-image" :src="get(actorData)?.image" />
                    </v-icon>
                  </template>
                  <v-icon v-else></v-icon>
                </v-col>
                <v-col style="padding: 12px 12px 3px 12px">
                  <template v-if="typeof msg === 'string'">
                    <div v-html="msg?.replaceAll('\n', '<br>')"></div>
                  </template>
                  <template v-if="typeof msg === 'object' && msg.type === MessageType.PDF_LINK">
                    <div class="d-flex justify-space-between">
                      <div class="d-flex flex-wrap">
                        <v-icon :icon="mdiBookMultiple"></v-icon>
                        <div v-for="link in msg.value" class="ml-2">
                          <a href="#" @click="onClickPdfLink(link)">{{ link.text }}</a>
                          <v-tooltip activator="parent" location="top">{{ link.info }}</v-tooltip>
                        </div>
                      </div>
                      <div class="d-flex">
                        <v-btn
                          variant="text"
                          density="compact"
                          :icon="mdiThumbUpOutline"
                          @click="onClickLike"
                        ></v-btn>
                        <v-btn
                          variant="text"
                          density="compact"
                          :icon="mdiThumbDown"
                          class="ml-2"
                          @click="onClickUnLike"
                        ></v-btn>
                      </div>
                    </div>
                  </template>
                </v-col>
              </v-row>
              <div class="d-flex justify-end" v-if="checkLikeVisibility(actor)">
                <v-btn
                  variant="text"
                  density="compact"
                  :icon="mdiThumbUpOutline"
                  @click="onClickLike"
                ></v-btn>
                <v-btn
                  variant="text"
                  density="compact"
                  :icon="mdiThumbDown"
                  class="ml-2"
                  @click="onClickUnLike"
                ></v-btn>
              </div>
            </v-container>
          </v-sheet>
        </v-container>

        <v-spacer></v-spacer>

        <v-divider class="mt-2"></v-divider>

        <v-textarea
          ref="textarea"
          class="mt-2 mx-7 flex-grow-0"
          rows="3"
          no-resize
          variant="solo"
          v-model="prompt"
          :disabled="mqttLoading || isVoiceInputWorking"
          :hint="mqttLoading ? '等待回覆中...' : ''"
          :loading="mqttLoading"
          clearable
          autofocus
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

        <v-container class="d-flex justify-center pa-0">
          <TheVoiceInput
            :disabled="mqttLoading"
            @message="onVoiceMessage"
            @start="onVoiceStart"
            @stop="onVoiceStop"
          />
        </v-container>
      </v-container>
    </pane>
    <pane size="60" class="h-100 right-panel">
      <ThePDFViewer ref="pdfViewer" :items="pdfViewerItems"></ThePDFViewer>
    </pane>
  </splitpanes>
</template>

<style lang="scss" scoped>
.left-panel {
  max-height: calc(100vh - 64px);
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
