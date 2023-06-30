/**
 * 添加自定義的 typescript type
 * ServiceXXXX：更新後端資料使用的格式
 */

import { ACTOR_TYPE } from '@/enums';

// export interface MyClass {
//   id: number;
//   createdAt: number;
//   modifiedAt: number;
//   createdBy: number;
//   name: string;
// }

// export interface MyClasses {
//   totalPages: number;
//   list: MyClass[];
// }

// export interface ServiceMyClass
//   extends Omit<MyClass, 'id' | 'createdAt' | 'modifiedAt' | 'createdBy'> {}

export interface Actor {
  id: number;
  createdAt: number;
  modifiedAt: number;
  created_by: number;
  name: string;
  description: string;
  url: string;
  image: string;
  prompt: string;
  temperature: number;
  type: ACTOR_TYPE;
}

export interface Actors {
  lastIndex: number;
  list: Actor[];
}

export interface ServiceActor extends Pick<Actor, 'name' | 'url'> {}
