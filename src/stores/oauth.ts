import type { Plan, User } from '@/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOAuthStore = defineStore('user', () => {
  const user: Ref<User | null> = ref(null);
  const plan: Ref<Plan | null> = ref(null);

  const getRemindDays = (): number => {
    const now = new Date().getTime();

    if (plan.value !== null) {
      const remindMilliseconds = (plan.value.createdAt + (plan.value.subscription ? plan.value.subscription.period : 0)) - now;
      return Math.ceil(remindMilliseconds / 24 / 60 / 60 / 1000);
    }
    return 0;
  }

  return { user, plan, getRemindDays };
});
