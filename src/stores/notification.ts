import type { Anchor } from '@/types/notification';
import { defineStore } from 'pinia';


export const useNotificationStore = defineStore('notification', {
  state: () => ({
    show: false as boolean,
    message: '' as string,
    location: '' as Anchor,
  }),
  actions: {
    fire(message: string, location: Anchor) {
      this.message = message;
      this.location = location
      this.show = true;
    },
  },
})