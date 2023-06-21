/**
 * 後端，角色 api
 */

// import { user } from '@/hooks/useUser';
import type { ServiceActor } from '@/types';
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
    baseURL: (import.meta.env.VITE_SERVER_HOST || location.origin) + '/api/v1/actor',
    headers: {
      Authorization: JSON.stringify(value),
    },
  });
}

// TODO: 待調整
instance = createInstance('');

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
  // TODO: 待調整
  // return instance('/', config);
  // alert(JSON.stringify(data, null, 2));

  return new Promise((resolve) => {
    setTimeout(() => {
      return resolve({
        data: {
          code: 4,
        },
      });
    }, 300);
  });
}

/**
 * 取得角色清單
 * @param options
 */
export function getActors(options?: {
  lastIndex?: number;
  count?: number;
  orderBy?: string | string[] | undefined;
  orderDirection?: string;
}) {
  const { lastIndex, count, orderBy, orderDirection } = options || {};
  const config = {
    method: 'get',
    params: {
      lastIndex: lastIndex || 1,
      count: count || 30,
      orderBy: 'name',
      orderDirection: 'ASC',
    } as Record<string, string | number>,
  };
  if (orderBy !== undefined) config.params.orderBy = orderBy.toString();
  if (orderDirection !== undefined) config.params.orderDirection = orderDirection;
  // return instance('/', config);
  // TODO: mock data
  return Promise.resolve({
    data: {
      lastIndex: 3,
      list: [
        {
          createdBy: 1,
          description: '',
          id: 3,
          image: 'https://photo.webduino.io/chat/cover.webp',
          name: '小書僮1',
          temperature: 0,
          url: 'https://google.com',
        },
        {
          createdBy: 1,
          description: '測試用2',
          id: 4,
          image: 'https://photo.webduino.io/chat/cover.webp',
          name: '小書僮2',
          temperature: 0,
          url: 'https://google.com',
        },
      ],
    },
  });
}

// /**
//  * 取得單一角色
//  * @param id
//  */
// export function getQuestion(id: number) {
//   const config = {
//     method: 'get',
//   };
//   return instance(`/questions/${id}`, config);
// }

// /**
//  * 更新角色
//  * @param id question id
//  * @param data question data
//  */
// export function updateQuestion(id: number, data: ServiceProblem) {
//   const config = {
//     method: 'put',
//     data,
//   };
//   return instance(`/questions/${id}`, config);
// }

// /**
//  * 刪除角色
//  * @param id
//  */
// export function deleteQuestion(id: number) {
//   const config = {
//     method: 'delete',
//   };
//   return instance(`/questions/${id}`, config);
// }

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
