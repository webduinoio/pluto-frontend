<script lang="ts" setup>
import TheActorAdvanced from '@/components/TheActorAdvanced.vue';
import TheActorDataManager from '@/components/TheActorDataManager.vue';
import TheActorSetting from '@/components/TheActorSetting.vue';
import { ACTOR_TYPE, ROUTER_NAME } from '@/enums';
import { useMainStore } from '@/stores/main';

const router = useRouter();
const store = useMainStore();

const tab = ref();

const onBack = () => {
  router.push({
    name: ROUTER_NAME.HOME,
  });
};

const onOpen = () => {
  if (!store?.actorEditData?.id) return;
  store.actorOpenID = store.actorEditData.id;
  if (store?.actorEditData?.type === ACTOR_TYPE.QUIZ) {
    router.push({
      name: ROUTER_NAME.STUDY_BUDDY_QUESTION,
    });
  } else {
    router.push({
      name: ROUTER_NAME.STUDY_BUDDY_QA,
    });
  }
};
</script>

<template>
  <v-layout>
    <v-container class="mb-5">
      <v-breadcrumbs
        :items="[{ title: '返回', disabled: false, href: '#' }]"
        @click.stop.prevent="onBack"
      >
        <template v-slot:prepend>
          <v-icon icon="mdi-chevron-left"></v-icon>
        </template>
      </v-breadcrumbs>
      <v-main>
        <v-toolbar class="bg-grey-lighten-2">
          <v-toolbar-title class="text-h4 font-weight-bold">
            {{ store?.actorEditData?.name }}
            <v-btn icon="mdi-open-in-new" color="grey-darken-1" @click="onOpen"></v-btn>
          </v-toolbar-title>

          <template v-slot:extension>
            <v-tabs v-model="tab" class="text-grey" color="black">
              <v-tab class="text-h6" value="setting">設定</v-tab>
              <v-tab class="text-h6" value="dataManager">資料管理</v-tab>
              <v-tab class="text-h6" value="advanced">進階設定</v-tab>
            </v-tabs>
          </template>
        </v-toolbar>
        <v-divider :thickness="2" class="divider"></v-divider>

        <v-window v-model="tab">
          <TheActorSetting value="setting" />
          <TheActorDataManager value="dataManager" />
          <TheActorAdvanced value="advanced" />
        </v-window>
      </v-main>
    </v-container>
  </v-layout>
</template>

<style lang="scss" scoped>
.divider {
  position: relative;
  top: -2px;
}
</style>

<style lang="scss">
.swal2-container {
  z-index: 9999 !important;
}
</style>
