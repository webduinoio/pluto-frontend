/**
 * 後端，資料集 API
 */

import { useAuthorizerStore } from '@/stores/authorizer';
import type { ServiceDataset } from '@/types/dataset';
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
 * 新增資料集
 *
 * @param data
 */
export function createDataset(data: ServiceDataset) {
  const authorizer = useAuthorizerStore();
  const config = {
    method: 'post',
    data,
  };
  return instance(`${authorizer.canEditAll ? '' : '/self'}/dataset`, config);
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
  const authorizer = useAuthorizerStore();
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
  return instance(`${authorizer.canEditAll ? '' : '/self'}/dataset`, config);
}

/**
 * 更新資料集
 * @param id
 * @param data
 */
export function updateDataset(id: number, data: ServiceDataset) {
  const authorizer = useAuthorizerStore();
  const config = {
    method: 'put',
    data,
  };
  return instance(`${authorizer.canEditAll ? '' : '/self'}/dataset/${id}`, config);
}

/**
 * 刪除資料集
 * @param id
 */
export function deleteDataset(id: number, actorID: number) {
  const authorizer = useAuthorizerStore();
  const config = {
    method: 'delete',
    data: {
      actorID
    }
  };
  return instance(`${authorizer.canEditAll ? '' : '/self'}/dataset/${id}`, config);
}
