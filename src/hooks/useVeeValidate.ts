/**
 * 使用 vee-validate 來做 input validation
 * 可使用的檢查條件 https://vee-validate.logaretm.com/v4/guide/global-validators/#available-rules
 */

import { LOCALE } from '@/enums';
import {
  localize,
  setLocale as setVeeValidateLocale,
} from '@vee-validate/i18n';
import en from '@vee-validate/i18n/dist/locale/en.json';
import zh_TW from '@vee-validate/i18n/dist/locale/zh_TW.json';
import AllRules from '@vee-validate/rules';
import { configure, defineRule } from 'vee-validate';

// TODO: 後續實作多語系時，需要調整
const LANG: string = LOCALE.ZH_HANT;

Object.keys(AllRules).forEach((rule) => {
  defineRule(rule, AllRules[rule]);
});

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
