import type { Actor } from '@/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useActorStore = defineStore('actor', () => {
  const refreshActors = ref(false);
  const editActor = ref<Actor>();

  return { refreshActors, editActor };
});
