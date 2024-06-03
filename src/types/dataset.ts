/**
 * 添加自定義的 typescript type
 * ServiceXXXX：更新後端資料使用的格式
 */

export interface Dataset {
  id: number;
  createdAt: number;
  modifiedAt: number;
  actorId: number;
  question: string;
  answer: string;
}

export interface Datasets {
  lastIndex: number;
  list: Dataset[];
}

export interface ServiceDataset {
  actorID: number;
  question: string;
  answer: string;
}

// export interface ServiceActorUpdate
//   extends Pick<Actor, 'description' | 'image' | 'prompt' | 'temperature'> {}
