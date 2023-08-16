import axios from 'axios';

// TODO: 之後需再優化
function createInstance() {
  return axios.create({
    baseURL: import.meta.env.VITE_SERVER_HOST + '/api/v1',
    withCredentials: true,
  });
}

const instance = createInstance();

/**
 * 取得權限表
 */
export async function getPermissions(role: string) {
  try {
    const config = {
      method: 'get',
    };
    return await instance(`/casbin/${role}/permission`, config);
  } catch (error) {
    console.error(error);
  }
}