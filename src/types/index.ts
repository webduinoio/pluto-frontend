/**
 * 添加自定義的 typescript type
 * ServiceXXXX：更新後端資料使用的格式
 */
// import type { ANSWER_RECORD_ERROR_TYPE, ANSWER_RECORD_FROM } from '@/enums';
// import type { Ref } from 'vue';

export * from './actors';
export * from './dataset';
export * from './user';

// TODO: 之後換成 mqtt.js
declare global {
  export const Paho: any;
}

export interface ChoiceType {
  type: 'choice';
  title: string;
  choices: string[];
  ans_idx: number;
  comment: string;
}

export interface QAType {
  type: 'Q&A';
  title: string;
  ans: string;
  comment: string;
}

export interface Response {
  code: number;
  message: string;
}