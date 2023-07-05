import type { Actor } from '@/types';
import { set } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMainStore = defineStore(
  'main',
  () => {
    const actorOpenID = ref(0);
    const actorEditData = ref<Actor>();

    const setEditData = (data: Actor) => {
      set(actorEditData, data);
    };

    return { actorOpenID, actorEditData, setEditData };
  },
  {
    // @ts-ignore
    persist: {
      enabled: true,
    },
  }
);
