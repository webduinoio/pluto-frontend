<script setup lang="ts">
/**
 * 進階設定 模板畫面
 */
import { NOTIFICATION_TIMEOUT } from '@/config';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { updateActor } from '@/services/actors';
import type { Actor } from '@/types';
import { mdiCheckCircle, mdiCloseCircle } from '@mdi/js';
import { set } from '@vueuse/core';
import { useField, useForm } from 'vee-validate';

const props = withDefaults(
  defineProps<{
    actor: Actor | undefined;
  }>(),
  {}
);

const optionTones = [
  { title: '無', value: 'na' },
  { title: '親切', value: '# 你會以友善的語氣回答問題，避免艱澀的詞彙' },
  { title: '幽默', value: '# 你會以幽默活潑的語氣回答問題' },
  { title: '正式', value: '# 你會以正式專業的語氣回答問題' },
];

const optionLanguages = [
  { title: '自動', value: 'na' },
  { title: 'English', value: '# answer in English' },
  { title: '繁體中文', value: '# 用繁體中文回答' },
];

const optionLengths = [
  { title: '自動', value: 'na' },
  { title: '精簡', value: '# 回答字數限制30字內' },
  { title: '適中', value: '# 回答字數限制200字內' },
];

const { fire } = useSweetAlert();
const loading = ref(false);

const { handleSubmit, setFieldValue } = useForm({
  initialValues: {
    prompt: '',
    role: '',
    tone: optionTones[0],
    language: optionLanguages[0],
    length: optionLengths[0],
  },
  // https://vee-validate.logaretm.com/v4/guide/global-validators/#available-rules
  validationSchema: {
    prompt: 'required|max:1000',
    role: 'required|max:100',
    tone: 'required',
    language: 'required',
    length: 'required',
  },
});

const prompt = useField('prompt', undefined, {
  label: 'Prompt',
});
const role = useField('role');
const tone = useField('tone');
const language = useField('language');
const length = useField('length');

const DEFAULT_PROMPT = `# 資料集
\`\`\`
{context}
\`\`\`

# 問題
\`\`\`
{question}
\`\`\`

你會仔細分析資料集的內容，一步一步思考從中取得有用資料來回答問題。如果資料集找不到相關資訊就說不知道，不要編造答案。
`;

const onReset = () => {
  setFieldValue('prompt', DEFAULT_PROMPT);
};

const onSubmit = handleSubmit(async (values) => {
  if (!props.actor?.id) return;
  try {
    set(loading, true);
    const form = new FormData();
    form.append('prompt', values.prompt);
    await updateActor(props.actor?.id, form);
    await fire({
      title: '更新完成',
      icon: 'success',
      timer: NOTIFICATION_TIMEOUT,
      showConfirmButton: false,
    });
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

watch(
  () => props.actor,
  (val) => {
    setFieldValue('prompt', val?.prompt || '');
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
                :error-messages="prompt.errorMessage.value"
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
                :false-icon="mdiCloseCircle"
                :true-icon="mdiCheckCircle"
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
            @click="onReset"
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
    border-color: #6d6d6d;
    border: 2px solid;
  }
  :deep(.v-switch__track:not(.v-selection-control--dirty .v-switch__track)) {
    background-color: #d9d9d9;
  }
}
</style>
