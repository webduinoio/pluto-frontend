/**
 * splitpanes 目前未有 typescript 設定檔，先暫時這樣處理
 * https://github.com/antoniandre/splitpanes/issues/144
 */

declare module 'splitpanes' {
  let Splitpanes: any;
  let Pane: any;

  export { Pane, Splitpanes };
}
