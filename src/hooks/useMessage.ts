/**
 * 處理消息的 hook
 * 部份訊息的回覆內容，會跟帳號有關，所以這邊會用到 useOAuthStore
 */

import { ERROR_CODE, RETURN_CODE_FROM_MQTT } from '@/enums';
import { useOAuthStore } from '@/stores/oauth';

export const useMessage = () => {
  const oauth = useOAuthStore();
  const isPro = ref(oauth.plan && oauth.plan.name !== 'free');

  const getErrorMessageForMqtt = (code: RETURN_CODE_FROM_MQTT) => {
    switch (code) {
      case RETURN_CODE_FROM_MQTT.TOO_MANY_PAGES_ERROR:
        return _addSuffix(`檔案超過 ${oauth.plan?.maxFilePages} 頁`);
      case RETURN_CODE_FROM_MQTT.FILE_TOO_LARGE_ERROR:
        return _addSuffix(`單一檔案超過 ${oauth.plan?.maxFileSize} MB`);
    }
    return '';
  };

  const getErrorMessageForGoogleDrive = (code: ERROR_CODE) => {
    switch (code) {
      case ERROR_CODE.FOLDER_NOT_VIEWABLE_ERROR:
        return '資料夾權限未分享';
      case ERROR_CODE.TOO_LARGE_ERROR:
        return _addSuffix(`單一檔案超過 ${oauth.plan?.maxFileSize} MB`);
      case ERROR_CODE.TOO_MANY_FILES_ERROR:
        return _addSuffix(`檔案超過 ${oauth.plan?.fileQuota} 個檔案`);
    }
    return '';
  }

  const _addSuffix = (msg: string) => {
    if (msg) return isPro.value ? `${msg}，請調整後再繼續。` : `${msg}，請升級方案或調整後再繼續。`;
    return msg;
  }

  return {
    getErrorMessageForMqtt,
    getErrorMessageForGoogleDrive,
  }
};
