import { useOAuthStore } from '@/stores/oauth';

const oauthStore = useOAuthStore();

export function generateMqttUserId() {
  return oauthStore.user?.oauthID + '_' + Math.random()
};
