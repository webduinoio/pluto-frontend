/**
 * 後端，OAuth api
 */

import { useLoginUrl } from '@/hooks/useOAuth';
import axios from 'axios';

// TODO: 之後需再優化
function createInstance() {
  return axios.create({
    baseURL: import.meta.env.VITE_OAUTH_SERVER_HOST + '/api/v1',
    withCredentials: true,
  });
}

const instance = createInstance();

/**
 * 登出
 */
export async function logout() {
  try {
    const config = {
      method: 'delete',
    };
    await instance('/auth/logout', config);
  } catch (error) {
    console.error(error);
  } finally {
    location.href = useLoginUrl();
  }
}

/**
 * 取得使用者
 */
export function getUser() {
  const config = {
    method: 'get',
  };
  return instance('/user/', config);
}
