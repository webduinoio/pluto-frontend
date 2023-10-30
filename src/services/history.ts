/**
 * 後端，對話記錄 api
 */

import axios from 'axios';

// TODO: 之後需再優化
function createInstance(value: any) {
  return axios.create({
    baseURL: (import.meta.env.VITE_SERVER_HOST || location.origin) + '/api/v1',
    headers: {
      Authorization: JSON.stringify(value),
    },
    withCredentials: true,
  });
}

// TODO: 待調整
const instance = createInstance('');

/**
 * 按讚或倒讚
 * @param data
 */
export function createReview(data: { id: number, like: boolean, reason?: string }) {
  const config = {
    method: 'put',
    data,
  };
  return instance(`/history`, config);
}