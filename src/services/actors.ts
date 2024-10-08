/**
 * 後端，角色 api
 */

import { useAuthorizerStore } from '@/stores/authorizer';
import type { ServiceActor } from '@/types';
import axios from 'axios';

interface GetActorsOptions {
  lastIndex?: string;
  count?: number;
  orderBy?: string | string[];
  orderDirection?: string;
  search?: string;
}

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
 * 新增角色
 *
 * code: 執行結果代碼
 * 0: 成功
 * 4: 網址錯誤
 * 6: 名稱重複
 *
 * @param data 角色資料
 */
export function createActor(data: ServiceActor) {
  const config = {
    method: 'post',
    data,
  };
  return instance('/actor', config);
}

/**
 * 取得角色清單
 * @param options
 */
export function getActors({
  lastIndex = '',
  count = 30,
  orderBy,
  orderDirection,
  search,
}: GetActorsOptions = {}) {
  const authorizer = useAuthorizerStore();

  const params: Record<string, string | number> = {
    lastIndex,
    count,
    ...(orderBy && { orderBy: Array.isArray(orderBy) ? orderBy.join(',') : orderBy }),
    ...(orderDirection && { orderDirection }),
    ...(search && { search }),
  };

  const config = {
    method: 'get',
    params,
  };

  const endpoint = authorizer.canReadAll ? '/actor' : '/self/actor';
  return instance(endpoint, config);
}

/**
 * 取得單一角色
 * @param id
 */
export function getActor(id: number) {
  const authorizer = useAuthorizerStore();
  const config = {
    method: 'get',
  };
  return instance(`${authorizer.canReadAll ? '' : '/self'}/actor/${id}`, config);
}

/**
 * 更新角色
 * @param id
 * @param data
 */
export function updateActor(id: number, data: any) {
  const authorizer = useAuthorizerStore();
  const config = {
    method: 'put',
    data,
  };
  return instance(`${authorizer.canEditAll ? '' : '/self'}/actor/${id}`, config);
}

/**
 * 刪除角色
 * @param id
 */
export function deleteActor(id: number) {
  const authorizer = useAuthorizerStore();
  const config = {
    method: 'delete',
  };
  return instance(`${authorizer.canDeleteAll ? '' : '/self'}/actor/${id}`, config);
}

/**
 * 訓練角色
 * @param id
 */
export function trainActor(id: number) {
  const authorizer = useAuthorizerStore();
  const config = {
    method: 'post',
  };
  return instance(`${authorizer.canEditAll ? '' : '/self'}/actor/${id}/train`, config);
}

/**
 * 取得角色擁有文件
 * @param id
 */
export function getActorDocuments(id: number) {
  const authorizer = useAuthorizerStore();
  const config = {
    method: 'get',
  };
  return instance(`${authorizer.canReadAll ? '' : '/self'}/actor/${id}/document`, config);
}

/**
 * 切換小助教分享的狀態
 * @param id
 */
export function toggleShareActor(id: number) {
  const authorizer = useAuthorizerStore();
  const config = {
    method: 'put',
  }
  return instance(`${authorizer.canEditAll ? '' : '/self'}/actor/${id}/shared`, config);
}

export function validateUrl(url: string) {
  const config = {
    method: 'post',
    data: {
      url
    }
  }
  return instance('/actor/validate', config);
}
