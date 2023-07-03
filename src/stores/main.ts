import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMainStore = defineStore(
  'main',
  () => {
    const actorOpenID = ref(0);
    const actorEditId = ref(0);

    return { actorOpenID, actorEditId };
  },
  {
    // @ts-ignore
    persist: {
      enabled: true,
    },
  }
);
