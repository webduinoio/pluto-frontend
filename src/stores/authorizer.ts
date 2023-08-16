import { Action, Effect } from '@/enums';
import { minimatch } from 'minimatch';
import { defineStore } from 'pinia';


export const useAuthorizerStore = defineStore('authorizer', {
  state: () => ({
    permissions: [] as string[][],
    user: '',
    canReadAll: false,
    canRead: true,
    canCreate: true,
    canEditAll: false,
    canEdit: true,
    canDeleteAll: false,
    canDelete: true,
  }),
  actions: {
    can(act: Action, target: string): boolean {
      let result = false;
      for (const [subject, object, action, effect] of this.permissions) {
        if (minimatch(this.user, subject) && minimatch(target, object.replace('*', '**')) && minimatch(act, action.replace('*', '**'))) {
          result = effect === Effect.ALLOW;
          if (!result) {
            break
          }
        }
      }
      return result;
    },
  },
  persist: true
})