import { defineStore } from 'pinia';
import type { RouteLocationNormalized } from 'vue-router';


export const useRouteStore = defineStore('route', {
  state: () => ({
    to: null as RouteLocationNormalized | null
  }),
  persist: true
})