<script setup lang="ts">
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { updateActor } from '@/services/actors';
import type { Actor } from '@/types';
import { set } from '@vueuse/core';
import { useField, useForm } from 'vee-validate';

const props = withDefaults(
  defineProps<{
    value: string;
    actor: Actor | undefined;
  }>(),
  {}
);

const emit = defineEmits<{
  (e: 'save', data: Actor): void;
}>();

const { fire } = useSweetAlert();

// TODO: file 格式的檢查，再研究看看，真不行，就混合 vuetify3 的檢查
const { handleSubmit, setFieldValue } = useForm({
  initialValues: {
    name: '',
    description: '',
    image: '',
  },
  // https://vee-validate.logaretm.com/v4/guide/global-validators/#available-rules
  validationSchema: {
    name: 'required|max:50',
    description: 'required|max:300',
    // image: 'required|image/jpg|image/png|size:250',
  },
});

const name = useField('name', undefined, {
  label: '小書僮名稱',
});
const description = useField('description', undefined, {
  label: '介紹你的小書僮',
});
const image = useField('image', undefined, {
  label: '小書僮圖片',
});
const loading = ref(false);
const rules = [
  (value: any) => {
    return !value || !value.length || value[0].size < 5000000 || '檔案不能大於 5 MB!';
  },
];

const OnClick = async () => {
  if (!props.actor) return;

  await navigator.clipboard.writeText(props.actor.uuid);
  await fire({
    title: '複製成功',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false,
  });
};

const onChange = (event: any) => {
  setFieldValue('image', event.target.files[0]);
};

const onSubmit = handleSubmit(async (values) => {
  if (!props.actor?.id) return;
  try {
    set(loading, true);
    const form = new FormData();
    form.append('name', values.name);
    form.append('description', values.description);
    form.append('image', values.image);
    await updateActor(props.actor.id, form);
    await fire({
      title: '更新完成',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    });

    const instance = JSON.parse(JSON.stringify(props.actor));
    instance.name = values.name;
    instance.description = values.description;
    instance.image = values.image;
    emit('save', instance);
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
    setFieldValue('description', val?.description || '');
    setFieldValue('name', val?.name || '');
  },
  { immediate: true }
);
</script>

<template>
  <v-window-item :value="props.value">
    <v-container>
      <v-sheet width="400" class="mt-4 bg-transparent">
        <v-form @submit.prevent="onSubmit">
          <p class="text-subtitle-2">小書僮 ID</p>
          <v-row align="center">
            <v-col cols="9">
              <p class="text-subtitle-1 text-disabled">{{ props.actor?.uuid }}</p>
            </v-col>
            <v-col cols="3">
              <v-btn color="secondary" variant="outlined" size="large" @click="OnClick">
                複製
              </v-btn>
            </v-col>
          </v-row>
          <v-text-field
            class="mt-5"
            variant="outlined"
            v-model="name.value.value"
            :error-messages="description.errorMessage.value"
            :counter="50"
            label="小書僮名稱"
            :disabled="loading"
          ></v-text-field>
          <v-textarea
            class="mt-2"
            variant="outlined"
            label="介紹你的小書僮"
            rows="3"
            :counter="300"
            v-model="description.value.value"
            :error-messages="description.errorMessage.value"
            :disabled="loading"
          ></v-textarea>
          <v-file-input
            class="mt-2"
            variant="outlined"
            label="小書僮圖片"
            accept=".jpg, .png, .jpeg"
            :disabled="loading"
            @change="onChange"
            :rules="rules"
            :error-messages="image.errorMessage.value"
            clearable
          >
            <template v-slot:selection="{ fileNames }">
              <template v-for="fileName in fileNames" :key="fileName">
                <v-chip size="small" label class="me-2">
                  {{ fileName }}
                </v-chip>
              </template>
            </template></v-file-input
          >
          <v-btn type="submit" color="primary" class="mt-12" size="large" :loading="loading">
            儲存
          </v-btn>
        </v-form>
      </v-sheet>
    </v-container>
  </v-window-item>
</template>

<style scoped></style>
