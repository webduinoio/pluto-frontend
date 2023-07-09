<script setup lang="ts">
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { updateActor } from '@/services/actors';
import { useMainStore } from '@/stores/main';
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

// TODO: file 格式的檢查，再研究看看，真不行，就混合 vuetify3 的檢查
const { handleSubmit, setFieldValue } = useForm({
  initialValues: {
    description: '',
    image: '',
  },
  // https://vee-validate.logaretm.com/v4/guide/global-validators/#available-rules
  validationSchema: {
    description: 'required|max:300',
    // image: 'required|image/jpg|image/png|size:250',
  },
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

const onChange = (event: any) => {
  setFieldValue('image', event.target.files[0]);
};

const onSubmit = handleSubmit(async (values) => {
  if (!store?.actorEditData?.id) return;
  try {
    set(loading, true);
    const form = new FormData();
    form.append('description', values.description);
    form.append('image', values.image);
    await updateActor(store?.actorEditData?.id, form);
    await fire({
      title: '更新完成',
      icon: 'success',
      timer: 1500,
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

onMounted(() => {
  setFieldValue('description', store?.actorEditData?.description || '');
});
</script>

<template>
  <v-window-item :value="props.value">
    <v-container>
      <v-sheet width="342" class="mt-4 bg-transparent">
        <v-form @submit.prevent="onSubmit">
          <v-textarea
            variant="outlined"
            label="介紹你的小書僮"
            rows="3"
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
