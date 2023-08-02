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

// TODO: 後續需要根據正式機/測試機進行調整
// export enum MQTT_TOPIC {
//   KN = import.meta.env.VITE_MQTT_TOPIC_KN, // 小書僮
//   CODE = import.meta.env.VITE_MQTT_TOPIC_CODE, // 思維工具
//   PROC = import.meta.env.VITE_MQTT_TOPIC_PROC, // actorId 處理訊息通報
// }

export const MQTT_TOPIC: Readonly<{
  KN: string;
  CODE: string;
  PROC: string;
}> = {
  KN: import.meta.env.VITE_MQTT_TOPIC_KN, // 小書僮
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
}

// export enum MARKDOWN_TYPE {
//   NONE = 'none',
//   MARKDOWN = 'markdown',
//   EXAM = 'exam',
//   QUESTION = 'question',
//   QUESTION_V2 = 'question_v2',
// }

// export enum ANSWER_RECORD_FROM {
//   QUESTION = 'question',
//   EXAM = 'exam-paper',
// }

// export enum ANSWER_RECORD_ERROR_TYPE {
//   ERROR = 'AssertionError',
//   TIMEOUT = 'TimeOutError',
//   OUT_OF_MEMORY = 'OutOfMemoryError',
// }

// export enum RESULT_VIEW_MODE {
//   LOCAL = 'local',
//   SERVER = 'server',
// }
