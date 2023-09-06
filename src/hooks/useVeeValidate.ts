/**
 * 使用 vee-validate 來做 input validation
 * 可使用的檢查條件 https://vee-validate.logaretm.com/v4/guide/global-validators/#available-rules
 */
import { ERROR_CODE, LOCALE } from '@/enums';
import { validateUrl } from '@/services';
import { useOAuthStore } from '@/stores/oauth';
import type { Response } from '@/types';
import {
  localize,
  setLocale as setVeeValidateLocale,
} from '@vee-validate/i18n';
import en from '@vee-validate/i18n/dist/locale/en.json';
import zh_TW from '@vee-validate/i18n/dist/locale/zh_TW.json';
import AllRules from '@vee-validate/rules';
import { AxiosError } from 'axios';
import { configure, defineRule } from 'vee-validate';

// TODO: 後續實作多語系時，需要調整
const LANG: string = LOCALE.ZH_HANT;

Object.keys(AllRules).forEach((rule) => {
  defineRule(rule, AllRules[rule]);
});

defineRule('google_drive', (value: string) => {
  const matched = value.match(/^https:\/\/drive\.google\.com\/drive\/folders\/([-_\w]+)/);
  if (!matched || matched.length != 2) {
    return '無效的 Google Drive 連結'
  }
  return true;
});

defineRule('google_drive_valid', (value: string) => {
  return validateUrl(value).then(() => {
    return true
  }).catch((err: AxiosError) => {
    if (err.response?.data) {
      const data = err.response.data as Response;
      const oauth = useOAuthStore();

      if (data.code === ERROR_CODE.FOLDER_NOT_VIEWABLE_ERROR) {
        return '資料夾權限未分享';
      } else if (data.code === ERROR_CODE.TOO_LARGE_ERROR) {
        return `單一檔案超過 ${oauth.plan?.maxFileSize} MB`;
      } else if (data.code === ERROR_CODE.TOO_MANY_FILES_ERROR) {
        return `檔案數量不能超過 ${oauth.plan?.fileQuota} 個`;
      }
    }
    return false
  });
})

configure({
  // ! 語系名稱不一致，也可正常執行！
  generateMessage: localize({
    [LOCALE.ZH_HANT]: zh_TW,
    [LOCALE.EN]: en,
  }),
});

setVeeValidateLocale(LANG);

export function setLocale(lang: LOCALE) {
  setVeeValidateLocale(lang);
}
