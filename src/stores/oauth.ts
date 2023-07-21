import type { User } from '@/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOAuthStore = defineStore('user', () => {
  const user: Ref<User | null> = ref(null);
  return { user };
});
