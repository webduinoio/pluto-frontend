/**
 * 後端，資料集 API
 */

// import { user } from '@/hooks/useUser';
import type { ServiceDataset } from '@/types/dataset';
import axios from 'axios';

let instance: any;

// watch(
//   () => user.value,
//   (val) => {
//     instance = createInstance(val);
//   },
//   { immediate: true }
// );

// TODO: 之後需再優化
function createInstance(value: any) {
  return axios.create({
    baseURL: (import.meta.env.VITE_SERVER_HOST || location.origin) + '/api/v1/dataset',
    headers: {
      Authorization: JSON.stringify(value),
    },
    withCredentials: true,
  });
}

// TODO: 待調整
instance = createInstance('');

/**
 * 新增資料集
 *
 * @param data
 */
export function createDataset(data: ServiceDataset) {
  const config = {
    method: 'post',
    data,
  };
  return instance('/', config);
}

/**
 * 取得資料集清單
 * @param options
 */
export function getDatasets(options?: {
  lastIndex?: number;
  count?: number;
  orderBy?: string | string[] | undefined;
  orderDirection?: string;
  search?: string;
  actorID: number;
}) {
  const { lastIndex, count, orderBy, orderDirection, actorID, search } = options || {};
  const config = {
    method: 'get',
    params: {
      lastIndex: lastIndex || 1,
      count: count || 30,
      orderBy: 'id',
      orderDirection: 'ASC',
      actorID,
    } as Record<string, string | number>,
  };
  if (orderBy !== undefined) config.params.orderBy = orderBy.toString();
  if (orderDirection !== undefined) config.params.orderDirection = orderDirection;
  if (search !== undefined) config.params.search = search;
  return instance('/', config);
}

// /**
//  * 取得單一角色
//  * @param id
//  */
// export function getActor(id: number) {
//   const config = {
//     method: 'get',
//   };
//   return instance(`/${id}`, config);
// }

/**
 * 更新資料集
 * @param id
 * @param data
 */
export function updateDataset(id: number, data: ServiceDataset) {
  const config = {
    method: 'put',
    data,
  };
  return instance(`/${id}`, config);
}

/**
 * 刪除資料集
 * @param id
 */
export function deleteDataset(id: number) {
  const config = {
    method: 'delete',
  };
  return instance(`/${id}`, config);
}

// /**
//  * 刪除多筆角色
//  * @param data { ids: number[] }
//  */
// export function deleteQuestions(data: { ids: number[] }) {
//   const config = {
//     method: 'delete',
//     data,
//   };
//   return instance('/questions', config);
// }
