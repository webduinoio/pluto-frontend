/**
 * 添加自定義的 typescript type
 * ServiceXXXX：更新後端資料使用的格式
 */

import { ACTOR_TYPE, PROMPT_MODE } from '@/enums';

export interface Actor {
  id: number;
  createdAt: number;
  modifiedAt: number;
  createdBy: number;
  name: string;
  shared: boolean;
  description: string;
  url: string;
  image: string;
  prompt: string;
  temperature: number;
  type: ACTOR_TYPE;
  uuid: string;
  recommends: Recommend[];
  abstract: string;
  condense: string;
  datasets: any[] | null;
  promptMode: PROMPT_MODE,
}

export interface Recommend {
  id: number;
  name: string;
  createdAt: number;
}

export interface Actors {
  lastIndex: number;
  list: Actor[];
}

export interface ServiceActor extends Pick<Actor, 'name' | 'url'> { }

export interface ServiceActorUpdate
  extends Pick<Actor, 'description' | 'image' | 'prompt' | 'temperature'> { }
