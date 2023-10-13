<script setup lang="ts">
import { ADVANCED_SETTING_MODE } from '@/enums';
import { useActorStore } from '@/stores/actor';
import { useAuthorizerStore } from '@/stores/authorizer';
import { get, set } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import ActorAdvancedSelfMode from './ActorAdvancedSelfMode.vue';
import ActorAdvancedTemplate from './ActorAdvancedTemplate.vue';

const props = withDefaults(
  defineProps<{
    value: string;
  }>(),
  {}
);

const { TEMPLATE, SELF } = ADVANCED_SETTING_MODE;
const authorizer = useAuthorizerStore();
const actorStore = useActorStore();
const { editActor } = storeToRefs(actorStore);
const mode = ref(TEMPLATE);

const buttonText = computed(() => {
  if (get(mode) === SELF) return '返回模板';
  return '切換自訂模式';
});

const onClick = () => {
  if (get(mode) === SELF) {
    set(mode, TEMPLATE);
  } else {
    set(mode, SELF);
  }
};
</script>

<template>
  <div class="d-flex justify-end" v-if="authorizer.canEditAll">
    <v-btn variant="text" @click="onClick" class="text-grey">
      {{ buttonText }}
    </v-btn>
  </div>

  <v-window-item :value="props.value">
    <ActorAdvancedSelfMode v-show="mode === SELF" v-model:actor="editActor" />
    <ActorAdvancedTemplate v-show="mode === TEMPLATE" v-model:actor="editActor" />
  </v-window-item>
</template>

<style scoped></style>
