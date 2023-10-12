<script setup lang="ts">
/**
 * 進階設定 模板畫面
 */
import { NOTIFICATION_TIMEOUT } from '@/config';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { updateActor } from '@/services/actors';
import type { Actor } from '@/types';
import { set } from '@vueuse/core';
import { useField, useForm } from 'vee-validate';

const props = withDefaults(
  defineProps<{
    actor: Actor | undefined;
  }>(),
  {}
);

const { fire } = useSweetAlert();
const loading = ref(false);

const { handleSubmit, setFieldValue } = useForm({
  initialValues: {
    prompt: '',
    image: '',
  },
  // https://vee-validate.logaretm.com/v4/guide/global-validators/#available-rules
  validationSchema: {
    prompt: 'required|max:1000',
  },
});

const prompt = useField('prompt', undefined, {
  label: 'Prompt',
});

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
    模板畫面
    <v-sheet class="mt-4 bg-transparent">
      <v-row>
        <v-col cols="12" md="6">
          <v-form @submit.prevent="onSubmit">
            <v-textarea
              variant="outlined"
              label="Prompt"
              rows="8"
              v-model="prompt.value.value"
              :error-messages="prompt.errorMessage.value"
              :disabled="loading"
            ></v-textarea>
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
          </v-form>
        </v-col>
      </v-row>
    </v-sheet>
  </v-container>
</template>

<style scoped></style>
