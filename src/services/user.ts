/**
 * 後端，使用者 api
 */

// import { user } from '@/hooks/useUser';
import axios from 'axios';

// TODO: 之後需再優化
function createInstance(value: any) {
  return axios.create({
    baseURL: (import.meta.env.VITE_SERVER_HOST || location.origin) + '/api/v1/user',
    headers: {
      Authorization: JSON.stringify(value),
    },
    withCredentials: true,
  });
}

// TODO: 待調整
const instance = createInstance('');

/**
 * 取得個人資訊
 */
export function getUser() {
  const config = {
    method: 'get',
  };
  return instance('/', config);
}

export async function getUserPlan() {
  const config = {
    method: 'get',
  }
  return (await instance('/plan', config)).data;
}