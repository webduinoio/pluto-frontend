/**
 * 其他 api
 */

import type { ChoiceType, QAType } from '@/types';

/**
 * 匯出試卷
 * 透過 google app script 處理
 */
export function createForm(data: { head: { title: string }; body: (ChoiceType | QAType)[] }) {
  try {
    // Replace SCRIPT_ID with the actual script ID
    const url =
      'https://script.google.com/macros/s/AKfycbzbE2nCEq3aoxohsTVMJ7ZaNJhzgZg1942AEyGyY3z10F2u1PRpq9azMygGqspwR1Z0/exec';
    return axios.post(url, data);
  } catch (error) {
    console.error(error);
  }
}
