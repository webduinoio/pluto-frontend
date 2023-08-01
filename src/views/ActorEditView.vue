<script lang="ts" setup>
import TheActorAdvanced from '@/components/TheActorAdvanced.vue';
import TheActorDataManager from '@/components/TheActorDataManager.vue';
import TheActorSetting from '@/components/TheActorSetting.vue';
import { ACTOR_TYPE, ROUTER_NAME } from '@/enums';
import { getActor } from '@/services/actors';
import type { Actor } from '@/types';
import { mdiChevronLeft, mdiOpenInNew } from '@mdi/js';
import { set } from '@vueuse/core';

const router = useRouter();
const route = useRoute();
const actor = ref<Actor>();

const tab = ref();

const onBack = () => {
  router.push({
    name: ROUTER_NAME.HOME,
  });
};

onMounted(async () => {
  try {
    const { data: value } = await getActor(Number(route.params.id));
    set(actor, value);
  } catch (err) {
    console.error(err);
  }
});

const onOpen = () => {
  if (!actor.value?.type) return;
  const location = router.resolve({
    name:
      actor.value.type === ACTOR_TYPE.QUIZ
        ? ROUTER_NAME.STUDY_BUDDY_QUESTION
        : ROUTER_NAME.STUDY_BUDDY_QA,
  });
  window.open(location.href, '_blank');
};

const onSave = (value: Actor) => {
  set(actor, value);
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
          <v-icon :icon="mdiChevronLeft"></v-icon>
        </template>
      </v-breadcrumbs>
      <v-main>
        <v-toolbar class="bg-transparent">
          <v-toolbar-title class="text-h4 font-weight-bold">
            {{ actor?.name }}
            <v-btn :icon="mdiOpenInNew" color="grey-darken-1" @click="onOpen"></v-btn>
          </v-toolbar-title>

          <template v-slot:extension>
            <v-tabs v-model="tab" class="text-grey" color="black">
              <v-tab class="text-h6 px-16" value="setting">設定</v-tab>
              <v-tab class="text-h6 px-16" value="dataManager">資料管理</v-tab>
              <v-tab class="text-h6 px-16" value="advanced">進階設定</v-tab>
            </v-tabs>
          </template>
        </v-toolbar>
        <v-divider :thickness="2" class="divider"></v-divider>

        <v-window v-model="tab">
          <TheActorSetting value="setting" :actor="actor" @save="onSave" />
          <TheActorDataManager value="dataManager" :actor="actor" />
          <TheActorAdvanced value="advanced" :actor="actor" />
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
