/**
 * 添加自定義的 typescript type
 * ServiceXXXX：更新後端資料使用的格式
 */

export interface Role {
  id: number;
  name: string;
  createdAt: number;
  modifiedAt: number;
};

export interface User {
  id: number;
  oauthID: number;
  createdAt: number;
  modifiedAt: number;
  role: Role;
  email: string;
  name: string;
  avatar: string;
}

export interface Subscription {
  id: number;
  createdAt: number;
  period: number;
}

export interface Plan {
  id: number;
  name: string;
  maxFileSize: number;
  maxFilePages: number;
  fileQuota: number;
  questionQuota: number;
  actorQuota: number;
  createdAt: number;
  subscription: Subscription | null;
}
