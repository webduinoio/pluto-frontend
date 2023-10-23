<script setup lang="ts">
/**
 * 進階設定 模板畫面
 */
import { NOTIFICATION_TIMEOUT } from '@/config';
import { PROMPT_MODE } from '@/enums';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { updateActor } from '@/services/actors';
import type { Actor } from '@/types';
import { mdiCheckCircle, mdiCloseCircle } from '@mdi/js';
import { get, set } from '@vueuse/core';
import { useField, useForm } from 'vee-validate';

const props = withDefaults(
  defineProps<{
    actor: Actor | undefined;
  }>(),
  {}
);

const emit = defineEmits<{
  (e: 'update:actor', data: Actor): void;
}>();

const optionTones = [
  { title: '無', value: '' },
  { title: '親切', value: '# 你會以友善的語氣回答問題，避免艱澀的詞彙' },
  { title: '幽默', value: '# 你會以幽默活潑的語氣回答問題' },
  { title: '正式', value: '# 你會以正式專業的語氣回答問題' },
];

const optionLanguages = [
  { title: '自動', value: '' },
  { title: 'English', value: '# answer in English' },
  { title: '繁體中文', value: '# 用中文回答' },
];

const optionLengths = [
  { title: '自動', value: '' },
  { title: '精簡', value: '# 回答字數限制30字內' },
  { title: '適中', value: '# 回答字數限制200字內' },
];

const DEFAULT_PROMPT = `# 資料集
\`\`\`
{context}
\`\`\`

# 問題
\`\`\`
{question}
\`\`\`

你會仔細分析資料集的內容，深呼吸，一步一步思考從中取得有用資料來回答問題。如果資料集找不到相關資訊就說不知道，不要編造答案。
`;

const DEFAULT_IMAGE_ON_PROMPT = `# 資料集
\`\`\`
{context}
\`\`\`

# 問題
\`\`\`
{question}
\`\`\`

## 回答問題
你會仔細閱讀資料集內容，然後一步一步思考從中取得有用資料來回答問題。如果資料集找不到相關資訊就說不知道，不要編造答案。
當你確認資料集中有 markdown 格式的圖片連結，例如 \`[alt text](URL)\`，請確保只回答真實的圖片連結，不要編造。

## Let's work this out in a step by step way to be sure we have the right answer
## 回答格式
如果資料集中有圖片連結，則先提供[圖片連結]，否則直接回答問題。
[回答問題]

`;

const { fire } = useSweetAlert();
const loading = ref(false);

const { handleSubmit, setFieldValue, resetForm } = useForm({
  initialValues: {
    role: '',
    tone: optionTones[0].value,
    language: optionLanguages[0].value,
    length: optionLengths[0].value,
    image: false,
  },
  // https://vee-validate.logaretm.com/v4/guide/global-validators/#available-rules
  validationSchema: {
    role: 'max:200',
  },
});

const role = useField('role');
const tone = useField('tone');
const language = useField('language');
const length = useField('length');
const image = useField('image');

const prompt = computed(() => {
  let value = image.value.value ? DEFAULT_IMAGE_ON_PROMPT : DEFAULT_PROMPT;

  if (role.value.value) {
    value += `# 你會扮演${role.value.value}\n`;
  }

  if (tone.value.value) {
    value += `${tone.value.value}\n`;
  }

  if (language.value.value) {
    value += `${language.value.value}\n`;
  }

  if (length.value.value) {
    value += `${length.value.value}\n`;
  }

  return value;
});

const onSubmit = handleSubmit(async (values) => {
  if (!props.actor?.id) return;
  try {
    set(loading, true);
    const form = new FormData();
    form.append('prompt', get(prompt));
    form.append('promptMode', PROMPT_MODE.TEMPLATE);
    const { data } = await updateActor(props.actor?.id, form);
    await fire({
      title: '更新完成',
      icon: 'success',
      timer: NOTIFICATION_TIMEOUT,
      showConfirmButton: false,
    });
    emit('update:actor', data);
  } catch (err: any) {
    console.error(err);
    fire({
      title: '儲存發生錯誤',
      icon: 'error',
      text: err.message,
    });
  } finally {
    set(loading, false);
  }
});

const _updateRole = (prompt: string) => {
  const regex = /# 你會扮演(.*)/m;
  const match = prompt.match(regex);
  if (match) {
    setFieldValue('role', match[1]);
  }
};

const _updateTone = (prompt: string) => {
  const regex = /# 你會以(?:友善|幽默活潑|正式專業)的語氣回答問題(?:，避免艱澀的詞彙)?/m;
  const match = prompt.match(regex);
  if (match) {
    const tone = optionTones.find((option) => option.value === match[0]);
    if (tone) {
      setFieldValue('tone', tone.value);
    }
  }
};

const _updateLanguage = (prompt: string) => {
  const regex = /# (用繁體中文回答|answer in English)/m;
  const match = prompt.match(regex);
  if (match) {
    const language = optionLanguages.find((option) => option.value === match[0]);
    if (language) {
      setFieldValue('language', language.value);
    }
  }
};

const _updateLength = (prompt: string) => {
  const regex = /# 回答字數限制(?:30|200)字內/m;
  const match = prompt.match(regex);
  if (match) {
    const length = optionLengths.find((option) => option.value === match[0]);
    if (length) {
      setFieldValue('length', length.value);
    }
  }
};

const _updateImage = (prompt: string) => {
  const regex = /## 回答問題[\s\S]*markdown 格式的圖片連結[\s\S]*## 回答格式[\s\S]*\[回答問題\]/m;
  setFieldValue('image', regex.test(prompt));
};

watch(
  () => props.actor,
  (val) => {
    if (!val || !val.prompt) return;
    _updateRole(val.prompt);
    _updateTone(val.prompt);
    _updateLanguage(val.prompt);
    _updateLength(val.prompt);
    _updateImage(val.prompt);
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <v-container>
    <v-sheet class="mt-4 bg-transparent">
      <!-- <v-row> -->
      <!-- <v-col cols="12" md="6"> -->
      <v-form @submit.prevent="onSubmit">
        <v-container>
          <v-row>
            <v-col cols="12" sm="4" md="3">
              <v-input :messages="['描述小助教扮演的角色']">扮演角色</v-input>
            </v-col>
            <v-col cols="12" sm="8" md="6">
              <v-textarea
                placeholder="( 某一科 ) 老師 / 工程師 / 律師 / 經驗豐富的解說員，擅長..."
                variant="outlined"
                rows="2"
                v-model="role.value.value"
                :error-messages="role.errorMessage.value"
                :disabled="loading"
              >
              </v-textarea>
            </v-col>
          </v-row>

          <v-divider class="my-2"></v-divider>

          <v-row class="mt-sm-4">
            <v-col cols="12" sm="4" md="3">
              <v-input hide-details>回答語氣</v-input>
            </v-col>
            <v-col cols="12" sm="8" md="6">
              <v-select
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                v-model="tone.value.value"
                :items="optionTones"
                :error-messages="tone.errorMessage.value"
                :disabled="loading"
              ></v-select>
            </v-col>
          </v-row>

          <v-divider class="my-2"></v-divider>

          <v-row class="mt-sm-4">
            <v-col cols="12" sm="4" md="3">
              <v-input hide-details>回答語言</v-input>
            </v-col>
            <v-col cols="12" sm="8" md="6">
              <v-select
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                v-model="language.value.value"
                :items="optionLanguages"
                :error-messages="language.errorMessage.value"
                :disabled="loading"
              ></v-select>
            </v-col>
          </v-row>

          <v-divider class="my-2"></v-divider>

          <v-row class="mt-sm-4">
            <v-col cols="12" sm="4" md="3">
              <v-input hide-details>回答長度</v-input>
            </v-col>
            <v-col cols="12" sm="8" md="6">
              <v-select
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                v-model="length.value.value"
                :items="optionLengths"
                :error-messages="length.errorMessage.value"
                :disabled="loading"
              ></v-select>
            </v-col>
          </v-row>

          <v-divider class="my-2"></v-divider>

          <v-row class="my-sm-2">
            <v-col cols="12" sm="4" md="3">
              <v-input :messages="['將資料集中的相關圖片顯示在回答中']">回答圖片 ( Beta )</v-input>
            </v-col>
            <v-col cols="12" sm="8" md="6">
              <v-switch
                class="custom-switch"
                hide-details
                inset
                v-model="image.value.value"
                :false-icon="mdiCloseCircle"
                :true-icon="mdiCheckCircle"
                :disabled="loading"
              ></v-switch>
            </v-col>
          </v-row>

          <v-divider class="my-2"></v-divider>

          <v-btn
            color="secondary"
            variant="outlined"
            class="mt-12"
            size="large"
            :disabled="loading"
            @click="resetForm"
          >
            重置
          </v-btn>
          <v-btn type="submit" color="primary" class="mt-12 ml-2" size="large" :loading="loading">
            儲存
          </v-btn>
        </v-container>
      </v-form>
      <!-- </v-col> -->
      <!-- </v-row> -->
    </v-sheet>
  </v-container>
</template>

<style scoped lang="scss">
.custom-switch {
  :deep(.v-selection-control--dirty .v-selection-control__input) {
    color: white;
  }
  :deep(.v-switch__track) {
    background-color: #467974;
    opacity: 1;
    border: 2px solid;
    border-color: #6d6d6d;
  }
  :deep(.v-switch__track:not(.v-selection-control--dirty *)) {
    background-color: #d9d9d9;
  }

  :deep(.v-selection-control__input:not(.v-selection-control--dirty *)) {
    color: #6d6d6d;

    & > i.v-icon {
      opacity: 1;
    }
  }
}
</style>
