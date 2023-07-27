<script setup lang="ts">
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { createDataset, updateDataset } from '@/services/dataset';
import type { Dataset } from '@/types/dataset';
import { get, set } from '@vueuse/core';
import { computed, mergeProps, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    title?: string;
    actorID?: number;
    editItem?: Dataset | null;
  }>(),
  {}
);

const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'update'): void;
}>();

const { fire, showLoading, hideLoading } = useSweetAlert();

const form = ref<HTMLFormElement>();
const dialog = ref(false);
const question = ref('');
const answer = ref('');
const rules = [
  (v: string) => v.length <= 300 || '最多 300 個字',
  (v: string) => !!v.length || '欄位不能為空',
];

const onCreate = async () => {
  try {
    showLoading();
    if (!props.actorID) return;
    await createDataset({
      actorID: props.actorID,
      question: get(question),
      answer: get(answer),
    });
    emit('create');
    set(dialog, false);
  } catch (err: any) {
    console.error(err);
    fire({
      title: '新增 Q & A 發生錯誤',
      icon: 'error',
      text: err.message,
    });
  } finally {
    hideLoading();
  }
};

const onUpdate = async () => {
  try {
    showLoading();
    if (!props?.editItem?.id) return;
    await updateDataset(props.editItem.id, {
      actorID: props.editItem.actorId,
      question: get(question),
      answer: get(answer),
    });
    emit('update');
    set(dialog, false);
  } catch (err: any) {
    console.error(err);
    fire({
      title: '修改 Q & A 發生錯誤',
      icon: 'error',
      text: err.message,
    });
  } finally {
    hideLoading();
    set(question, '');
    set(answer, '');
  }
};

const onSubmit = async () => {
  if (!form.value) {
    return;
  }

  const { valid } = await form.value.validate();
  if (valid) {
    props.editItem ? onUpdate() : onCreate();
  }
};

// 提供 slot 綁定的事件內容
const defaultSlotEvents = computed(() => {
  return {
    onClick() {
      set(dialog, true);
    },
  };
});

// 提供 slot 綁定的屬性
const defaultSlotProps = mergeProps(defaultSlotEvents.value);

watch(
  () => props.editItem,
  (val) => {
    if (!val) return;
    set(question, val.question);
    set(answer, val.answer);
  },
  { immediate: true }
);

watch(dialog, () => {
  if (!props.editItem) {
    set(question, '');
    set(answer, '');
  }
});
</script>

<template>
  <slot v-bind="{ props: defaultSlotProps }">
    <v-btn
      color="secondary"
      variant="elevated"
      class="ml-2"
      size="large"
      flat
      v-bind="defaultSlotProps"
    >
      {{ props.title }}
    </v-btn>
  </slot>
  <v-dialog v-model="dialog" persistent max-width="500px">
    <v-card>
      <v-form @submit.prevent="onSubmit" ref="form">
        <v-card-title class="mt-5 mx-5">
          <span class="text-h5 font-weight-bold">{{ props.title }}</span>
        </v-card-title>

        <v-card-text>
          <div class="mx-4 text-body-1 text-grey-darken-2">請輸入 Q & A 後，點擊再次訓練。</div>
          <v-container class="mt-10">
            <v-row>
              <v-col cols="12">
                <v-textarea
                  counter
                  variant="outlined"
                  label="Q:"
                  rows="3"
                  :rules="rules"
                  v-model="question"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  counter
                  variant="outlined"
                  label="A:"
                  rows="3"
                  :rules="rules"
                  v-model="answer"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="mb-4">
          <v-spacer></v-spacer>
          <v-btn color="secondary" variant="outlined" size="large" flat @click="dialog = false">
            取消
          </v-btn>
          <v-btn color="secondary" variant="elevated" class="mr-5" size="large" flat type="submit">
            儲存
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
