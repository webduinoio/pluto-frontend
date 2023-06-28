/**
 * 添加自定義的 typescript type
 * ServiceXXXX：更新後端資料使用的格式
 */
// import type { ANSWER_RECORD_ERROR_TYPE, ANSWER_RECORD_FROM } from '@/enums';
// import type { Ref } from 'vue';

export * from './actors';

// TODO: 之後換成 mqtt.js
declare global {
  export const Paho: any;
}
