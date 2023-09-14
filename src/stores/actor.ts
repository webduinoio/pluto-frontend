import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useActorStore = defineStore('actor', () => {
  const refreshActors = ref(false);
  return { refreshActors };
})
