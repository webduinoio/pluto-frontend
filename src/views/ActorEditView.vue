<script lang="ts" setup>
// import { useSweetAlert } from '@/hooks/useSweetAlert';
import { useMainStore } from '@/stores/main';
// import { useField, useForm } from 'vee-validate';

const router = useRouter();
const store = useMainStore();

console.log('>>> 編輯的 id:', store.actorEditId);

const onBack = () => {
  router.push({
    name: 'Home',
  });
};

const tab = ref();
const tab2 = ref();

// const { fire, showLoading, hideLoading } = useSweetAlert();
// const { resetForm, handleSubmit } = useForm({
//   initialValues: {
//     name: '',
//     url: '',
//   },
//   // https://vee-validate.logaretm.com/v4/guide/global-validators/#available-rules
//   validationSchema: {
//     name: 'required',
//     url: 'required|url',
//   },
// });

// const name = useField('name', undefined, {
//   label: '名稱',
// });
// const url = useField('url', undefined, {
//   label: '網址',
// });

// const onSubmit = handleSubmit(async (values) => {
//   showLoading();
//   const {
//     data: { code },
//   } = await createActor(values);

//   hideLoading();

//   if (code === 4) {
//     await fire({
//       title: '發生錯誤',
//       icon: 'error',
//       text: '網址不正確',
//     });
//     return;
//   }

//   if (code === 6) {
//     await fire({
//       title: '發生錯誤',
//       icon: 'error',
//       text: '名稱重複',
//     });
//     return;
//   }

//   resetForm();
//   await fire({
//     title: '更新完成',
//     icon: 'success',
//     timer: 2000,
//     showConfirmButton: false,
//   });
//   router.push({ name: 'Home' });
// });

// const snackbar = ref(false);
// const text = ref(`更新完成`);
</script>

<template>
  <v-layout>
    <v-container class="mb-6">
      <v-breadcrumbs :items="[{ title: '返回', disabled: false, href: '#' }]" @click="onBack">
        <template v-slot:prepend>
          <v-icon icon="mdi-chevron-left"></v-icon>
        </template>
      </v-breadcrumbs>
      <v-main>
        <v-toolbar class="bg-grey-lighten-2">
          <v-toolbar-title class="text-h4 font-weight-bold">
            神鵰俠侶
            <v-btn icon="mdi-open-in-new" color="grey-darken-1"></v-btn>
          </v-toolbar-title>

          <template v-slot:extension>
            <v-tabs v-model="tab" class="text-grey" color="black">
              <!-- <v-tab class="text-h6" value="one">設定</v-tab> -->
              <v-tab class="text-h6" value="dataManager">資料管理</v-tab>
              <!-- <v-tab class="text-h6" value="three">進階設定</v-tab> -->
            </v-tabs>
          </template>
        </v-toolbar>
        <v-divider :thickness="2" class="divider"></v-divider>

        <v-window v-model="tab">
          <!-- <v-window-item value="one">
            <v-card flat>
              <v-card-text> One</v-card-text>
            </v-card>
          </v-window-item> -->

          <v-window-item value="dataManager">
            <v-tabs v-model="tab2" class="text-grey" color="black">
              <v-tab class="text-h6" value="file">檔案</v-tab>
              <!-- <v-tab class="text-h6" value="qa">Q & A</v-tab> -->
            </v-tabs>

            <v-window v-model="tab2">
              <v-window-item value="file">
                <v-container>
                  <v-row>
                    <v-col cols="12" class="d-flex align-center">
                      <div class="text-body-2 mr-2">
                        請開啟雲端硬碟資料夾，更新訓練資料後，點擊再次訓練。訓練資料說明
                      </div>
                      <v-btn
                        size="x-small"
                        density="compact"
                        icon="mdi-open-in-new"
                        variant="plain"
                        color="grey-darken-2"
                      ></v-btn>
                    </v-col>
                  </v-row>
                  <v-row align-content="center">
                    <v-col cols="12" md="4">
                      <div class="text-h6 font-weight-regular">Google 雲端硬碟資料夾</div>
                    </v-col>
                    <v-col>
                      <v-btn color="orange" variant="outlined" size="large">開啟</v-btn>
                    </v-col>
                  </v-row>
                  <v-row align-content="center">
                    <v-col cols="12">
                      <v-btn color="#467974" class="text-white" size="large">再次訓練</v-btn>
                    </v-col>
                    <v-col cols="6">
                      <v-progress-linear indeterminate color="#467974"></v-progress-linear>
                    </v-col>
                  </v-row>
                </v-container>
              </v-window-item>
              <!-- <v-window-item value="qa">
                <v-card flat>
                  <v-card-text> 2-2</v-card-text>
                </v-card>
              </v-window-item> -->
            </v-window>
          </v-window-item>
          <!-- <v-window-item value="three"> Three </v-window-item> -->
        </v-window>
      </v-main>
    </v-container>
  </v-layout>
</template>

<style lang="scss">
.divider {
  position: relative;
  top: -2px;
}
</style>
