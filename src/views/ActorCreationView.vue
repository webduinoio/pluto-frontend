<script lang="ts" setup>
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { createActor } from '@/services';
import { useField, useForm } from 'vee-validate';

const router = useRouter();
const { fire, showLoading, hideLoading } = useSweetAlert();
const { resetForm, handleSubmit } = useForm({
  initialValues: {
    name: '',
    url: '',
  },
  // https://vee-validate.logaretm.com/v4/guide/global-validators/#available-rules
  validationSchema: {
    name: 'required',
    url: 'required|url',
  },
});

const name = useField('name', undefined, {
  label: '名稱',
});
const url = useField('url', undefined, {
  label: '網址',
});

// TODO: 待調整
const onSubmit = handleSubmit(async (values) => {
  showLoading();
  const {
    data: { code },
  } = await createActor(values);

  hideLoading();

  if (code === 4) {
    await fire({
      title: '發生錯誤',
      icon: 'error',
      text: '網址不正確',
    });
    return;
  }

  if (code === 6) {
    await fire({
      title: '發生錯誤',
      icon: 'error',
      text: '名稱重複',
    });
    return;
  }

  resetForm();
  await fire({
    title: '更新完成',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
  });
  router.push({ name: 'Home' });
});

const snackbar = ref(false);
const text = ref(`更新完成`);
</script>

<template>
  <v-container class="mb-6 h-100">
    <div class="h-100 d-flex justify-center align-center flex-column">
      <p class="text-h4">新增小書僮</p>
      <v-sheet width="342" class="mx-auto mt-14 bg-grey-lighten-2">
        <v-form @submit.prevent="onSubmit">
          <v-text-field
            label="小書僮名稱"
            v-model="name.value.value"
            :error-messages="name.errorMessage.value"
          ></v-text-field>
          <v-text-field
            label="Google 雲端資料網址"
            class="mt-2"
            v-model="url.value.value"
            :error-messages="url.errorMessage.value"
          ></v-text-field>
          <div class="mt-16 d-flex justify-center">
            <v-btn type="submit" color="indigo-darken-3" size="large">開始訓練</v-btn>
          </div>
        </v-form>
      </v-sheet>
    </div>
  </v-container>
</template>

<style lang="scss"></style>
