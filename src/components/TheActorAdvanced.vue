<script setup lang="ts">
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { getActor, updateActor } from '@/services/actors';
import { useMainStore } from '@/stores/main';
import type { Actor } from '@/types';
import { set } from '@vueuse/core';
import { useField, useForm } from 'vee-validate';

const props = withDefaults(
  defineProps<{
    value: string;
  }>(),
  {}
);

const store = useMainStore();
const { fire } = useSweetAlert();
const loading = ref(true);
const data = ref<Actor>();

const { handleSubmit, setFieldValue } = useForm({
  initialValues: {
    prompt: '',
    image: '',
  },
  // https://vee-validate.logaretm.com/v4/guide/global-validators/#available-rules
  validationSchema: {
    prompt: 'required',
  },
});

const prompt = useField('prompt', undefined, {
  label: '介紹你的小書僮',
});

const loadData = async () => {
  try {
    if (!store?.actorEditData?.id) return null;
    const { data } = await getActor(store.actorEditData.id);
    return data;
  } catch (err: any) {
    console.error(err);
    return null;
  }
};

const onReset = () => {
  setFieldValue('prompt', data.value?.prompt || '');
};

const onSubmit = handleSubmit(async (values) => {
  if (!store?.actorEditData?.id) return;
  try {
    set(loading, true);
    const form = new FormData();
    form.append('prompt', values.prompt);
    await updateActor(store?.actorEditData?.id, form);
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

onMounted(async () => {
  set(loading, true);
  const value = await loadData();
  value && set(data, value);
  set(loading, false);
  setFieldValue('prompt', value?.prompt || '');
});
</script>

<template>
  <v-window-item :value="props.value">
    <v-container>
      <v-sheet class="mt-4 bg-grey-lighten-2">
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
                color="orange"
                variant="outlined"
                class="text-white mt-12"
                size="large"
                :disabled="loading"
                @click="onReset"
              >
                重置
              </v-btn>
              <v-btn
                type="submit"
                color="#467974"
                class="text-white mt-12 ml-2"
                size="large"
                :loading="loading"
              >
                儲存
              </v-btn>
            </v-form>
          </v-col>
        </v-row>
      </v-sheet>
    </v-container>
  </v-window-item>
</template>

<style scoped></style>
