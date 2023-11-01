<script setup lang="ts">
import { createReview } from '@/services/history';
import { mdiCloseCircle, mdiWindowClose } from '@mdi/js';
import { set } from '@vueuse/core';
import { useForm } from 'vee-validate';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    feedbackId?: number | string;
  }>(),
  {
    modelValue: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit'): void;
}>();

const route = useRoute();
const radioOptions = ref([
  {
    label: '與事實不符',
    value: '與事實不符',
  },
  {
    label: '沒有回答問題',
    value: '沒有回答問題',
  },
  {
    label: '可能冒犯他人',
    value: '可能冒犯他人',
  },
  {
    label: '其他',
    value: 'other',
  },
]);
const loading = ref(false);
const formId = ref(`form-${Date.now()}`);
const textarea = ref();

const { handleSubmit, defineComponentBinds, errors, setFieldValue } = useForm({
  initialValues: {
    radio: radioOptions.value[0].value,
    reason: '',
  },
  // https://vee-validate.logaretm.com/v4/guide/global-validators/#available-rules
  validationSchema: {
    reason: 'max:50',
  },
});

const radio = defineComponentBinds('radio');
const reason = defineComponentBinds('reason');

const onSubmit = handleSubmit(async (values) => {
  set(loading, true);
  try {
    if (props.feedbackId) {
      const data = {
        id: Number(props.feedbackId),
        like: false,
        reason: '',
      };
      if (values.radio === 'other') {
        data.reason = values.reason;
      } else {
        data.reason = values.radio;
      }
      await createReview(data);
    }
  } catch (err) {
    console.error(err);
  }
  emit('update:modelValue', false);
  emit('submit');
  set(loading, false);
});

const onChangeRadio = (value: string) => {
  if (value === 'other') {
    nextTick(() => {
      textarea.value.focus();
    });
  } else {
    setFieldValue('reason', '');
  }
};
</script>

<template>
  <v-dialog v-model="props.modelValue" width="436px" persistent>
    <v-card variant="elevated" class="rounded-lg" :disabled="loading">
      <template v-slot:append>
        <v-btn
          class="mt-n3"
          :icon="mdiWindowClose"
          variant="text"
          @click="emit('update:modelValue', false)"
        ></v-btn>
      </template>
      <template v-slot:title>
        <p class="text-h5 font-weight-bold mt-3">提供回饋</p>
      </template>
      <v-card-subtitle class="mt-4 ml-6 pa-0"> 我覺得小助教的回答... </v-card-subtitle>
      <v-card-text>
        <v-form :id="formId" @submit.prevent="onSubmit">
          <v-radio-group hide-details v-bind="radio" @update:model-value="onChangeRadio">
            <v-radio v-for="val in radioOptions" :label="val.label" :value="val.value"></v-radio>
          </v-radio-group>

          <v-textarea
            ref="textarea"
            class="ml-10 mt-2 mr-10"
            no-resize
            variant="outlined"
            clearable
            rows="4"
            counter="50"
            v-bind="reason"
            autofocus
            :disabled="radio.modelValue !== 'other'"
            :clear-icon="mdiCloseCircle"
            :error-messages="errors.reason"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end mt-n2 mb-6 mr-6">
        <v-btn
          color="secondary"
          variant="elevated"
          size="large"
          type="submit"
          :loading="loading"
          :form="formId"
        >
          送出
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
