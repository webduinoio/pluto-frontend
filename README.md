# pluto-frontend

小書僮

## 大綱

- [pluto-frontend](#pluto-frontend)
  - [大綱](#大綱)
  - [環境需求](#環境需求)
  - [本機開發](#本機開發)
    - [安裝](#安裝)
    - [開發](#開發)
    - [打包](#打包)
    - [執行預覽 (打包後)](#執行預覽-打包後)
  - [部署更新時間](#部署更新時間)
  - [VSCode](#vscode)
  - [Type Support for `.vue` Imports in TS](#type-support-for-vue-imports-in-ts)

## 環境需求

- `nodejs 18.14.2`
- `vuetify 3.3.3`

## 本機開發

### 安裝

```bash
npm install
```

### 開發

為了串接 OAuth，在本地開發時必須也要使用 `https` 才能夠將 cookies 傳送到 OAuth 測試機

```bash
npm run dev:ssl

# 打開網址 https://localhost.webduino.io
```

### 打包

```bash
npm run build

# 打開網址 http://localhost:4173
```

### 執行預覽 (打包後)

```bash
npm run preview
```

## 部署更新時間

檢查部署更新時間，打開網頁開發者工具，html 元素上，可查看 data-time 屬性。

<!-- ## i18n -->

<!-- 1. 在 [i18n/index.ts](src/i18n/index.ts) 處理 `vue-i18n`、`lit localization`、`blockly` 的語系設定，並提供 api。
2. vue-router 呼叫 i18n api，來設定語系。 -->

<!-- ## Lit Element -->

<!-- - i18n
  - [官方說明](https://lit.dev/docs/localization/overview/)，選擇 `runtime mode`。
  - 建立步驟
    1. 透過 gulp，監控 lit element 檔案，產生 xliff 檔案。
    2. xliff 檔案，是將 lit element 中，符合規則的字串，轉成 xliff 格式而來。
    3. xliff 檔案，將翻譯好的字串，填入。
    4. 透過 gulp，監控 xliff 資料夾，執行 `lit-localize build`，將 xliff 檔案轉成 js 檔案。
  - `lit-localize build` 會參考設定檔內容 [lit-localize.json](lit-localize.json)。 -->

## VSCode

建議可安裝套件

- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## Type Support for `.vue` Imports in TS

在 Volar 套件，說明中，有要求關閉 vscode 內建的 typescript 功能，可見下方說明，或是參考[官方連結](https://vuejs.org/guide/typescript/overview.html#volar-takeover-mode)。

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
