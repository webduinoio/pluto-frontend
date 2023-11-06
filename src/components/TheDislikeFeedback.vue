<script setup lang="ts">
import { LOCALE } from '@/enums';
import { COLOR } from '@/enums/style';
import { createReview } from '@/services/history';
import { mdiCloseCircle, mdiWindowClose } from '@mdi/js';
import { localize } from '@vee-validate/i18n';
import { set } from '@vueuse/core';
import { configure, useForm } from 'vee-validate';

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
const textarea = ref();

configure({
  generateMessage: localize(LOCALE.ZH_HANT, {
    names: {
      reason: '說明',
    },
  }),
});

const { handleSubmit, defineComponentBinds, errors, setFieldValue, resetForm } = useForm({
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

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      nextTick(() => {
        resetForm();
      });
    }
  }
);
</script>

<template>
  <v-dialog v-model="props.modelValue" width="436px" persistent>
    <v-card variant="elevated" class="rounded-lg" :disabled="loading">
      <template v-slot:title class="mt-3">
        <div class="d-flex justify-space-between align-start mt-3">
          <p class="text-h5 ml-2 font-weight-bold">提供回饋</p>
          <v-btn
            :icon="mdiWindowClose"
            variant="text"
            density="compact"
            @click="emit('update:modelValue', false)"
          ></v-btn>
        </div>
      </template>
      <template v-slot:subtitle>
        <p class="mt-4 ml-2">我覺得小助教的回答...</p>
      </template>
      <v-card-text>
        <v-form @submit.prevent="onSubmit">
          <v-radio-group hide-details v-bind="radio" @update:model-value="onChangeRadio">
            <v-radio
              v-for="val in radioOptions"
              :color="COLOR.C02"
              :label="val.label"
              :value="val.value"
            >
              <template v-slot:label>
                <div class="text-high-emphasis">
                  {{ val.label }}
                </div>
              </template>
            </v-radio>
          </v-radio-group>

          <v-textarea
            ref="textarea"
            class="ml-2 mt-2"
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

          <div class="d-flex justify-end pb-4 mt-2">
            <v-btn
              color="secondary"
              variant="elevated"
              size="large"
              type="submit"
              :loading="loading"
            >
              送出
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
