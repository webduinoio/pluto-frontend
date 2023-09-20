/**
 * 使用 vee-validate 來做 input validation
 * 可使用的檢查條件 https://vee-validate.logaretm.com/v4/guide/global-validators/#available-rules
 */
import { LOCALE } from '@/enums';
import { validateUrl } from '@/services';
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
import { useMessage } from './useMessage';

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
      const { getErrorMessageForGoogleDrive } = useMessage();
      const errorMessage = getErrorMessageForGoogleDrive(data.code);
      if (errorMessage) {
        return errorMessage;
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
