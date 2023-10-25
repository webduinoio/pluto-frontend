/**
 * 待擴充 enums
 */

// for test
// export enum MQTT_ACTORS {
//   ENGLISH = 'eng',
// }

export enum LOCALE {
  EN = 'en',
  ZH_HANT = 'zh-hant',
}

export enum GENERATE_QUESTION_TYPE {
  CHOICE = 'choice',
  QA = 'Q&A',
}

export const MQTT_TOPIC: Readonly<{
  KN: string;
  CODE: string;
  PROC: string;
}> = {
  KN: import.meta.env.VITE_MQTT_TOPIC_KN, // 小助教
  CODE: import.meta.env.VITE_MQTT_TOPIC_CODE, // 思維工具
  PROC: import.meta.env.VITE_MQTT_TOPIC_PROC, // actorId 處理訊息通報
}

export enum ACTOR_TYPE {
  TUTORIAL = 'tutorial',
  QUIZ = 'quiz',
  SHEET = 'sheet',
  WEBBIT = 'webbit',
  PYTHON = 'python',
}

export enum ROUTER_NAME {
  HOME = 'home',
  ACTOR_CREATION = 'ActorCreation',
  ACTOR_EDIT = 'ActorEdit',
  STUDY_BUDDY_QA = 'StudyBuddyQA',
  STUDY_BUDDY_QUESTION = 'StudyBuddyQuestion',
  STUDY_BUDDY_GOOGLE_SHEET = 'StudyBuddyGoogleSheet',
  NOTIFICATION_LOGIN = 'NotificationLogin',
}

export enum ERROR_CODE {
  NO_ERROR = 0,
  INTERNAL_SERVER_ERROR = 1,
  UNAUTHENTICATED_ERROR = 2,
  UNAUTHORIZED_ERROR = 3,
  VALIDATION_ERROR = 4,
  NOT_FOUND_ERROR = 5,
  DUPLICATE_ERROR = 6,
  FOLDER_NOT_VIEWABLE_ERROR = 7,
  FOLDER_WRONG_URL_ERROR = 8,
  TOO_LARGE_ERROR = 9,
  TOO_MANY_FILES_ERROR = 10,
  TOO_MANY_ACTOR_ERROR = 11,
}

export enum RETURN_CODE_FROM_MQTT {
  ERROR = -1,
  TOO_MANY_PAGES_ERROR = -2,
  FILE_TOO_LARGE_ERROR = -3,
}

export enum Action {
  READ = 'GET',
  CREATE = 'POST',
  EDIT = 'PUT',
  DELETE = 'DELETE',
  ALL = '*'
}

export enum Effect {
  ALLOW = 'allow',
  DENY = 'deny',
}

export enum Permission {
  ACTOR_ADMIN = '/api/v1/actor/',
  ACTOR_NORMAL = '/api/v1/self/actor/',
}

export enum PROMPT_MODE {
  CUSTOMIZE = 'customize',
  TEMPLATE = 'template',
}