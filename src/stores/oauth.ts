import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOAuthStore = defineStore('user', () => {
  const user: Ref<{ email: string } | null> = ref(null);
  return { user };
});
