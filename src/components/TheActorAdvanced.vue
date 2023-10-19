<script setup lang="ts">
import { PROMPT_MODE } from '@/enums';
import { useActorStore } from '@/stores/actor';
import { get, set } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import ActorAdvancedCustomize from './ActorAdvancedCustomize.vue';
import ActorAdvancedTemplate from './ActorAdvancedTemplate.vue';

const props = withDefaults(
  defineProps<{
    value: string;
  }>(),
  {}
);

const { CUSTOMIZE, TEMPLATE } = PROMPT_MODE;
const actorStore = useActorStore();
const { editActor } = storeToRefs(actorStore);
const mode = ref(CUSTOMIZE);

const buttonText = computed(() => {
  return get(mode) === CUSTOMIZE ? '返回模板' : '切換自訂模式';
});

const onClick = () => {
  get(mode) === CUSTOMIZE ? set(mode, TEMPLATE) : set(mode, CUSTOMIZE);
};

onMounted(() => {
  // 一開始建立的小助教，都是自訂模式，因此預設為自訂模式
  set(mode, editActor.value?.promptMode || CUSTOMIZE);
});
</script>

<template>
  <v-window-item :value="props.value">
    <div class="d-flex justify-end">
      <v-btn variant="text" @click="onClick" class="text-grey">
        {{ buttonText }}
      </v-btn>
    </div>
    <ActorAdvancedCustomize v-show="mode === CUSTOMIZE" v-model:actor="editActor" />
    <ActorAdvancedTemplate v-show="mode === TEMPLATE" v-model:actor="editActor" />
  </v-window-item>
</template>

<style scoped></style>
