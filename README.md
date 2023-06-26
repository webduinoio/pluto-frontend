# pluto-frontend

小書僮

## 大綱

- [pluto-frontend](#pluto-frontend)
  - [大綱](#大綱)
  - [環境需求](#環境需求)
  - [本機開發](#本機開發)
    - [開發網址](#開發網址)
    - [部署更新時間](#部署更新時間)
    - [i18n](#i18n)
    - [Lit Element](#lit-element)
    - [VSCode](#vscode)
    - [注意](#注意)

## 環境需求

<!-- - `nodejs 18.14.2`
- `tailwindcss 3.2.4`
- `daisyUI 2.51.5` -->

## 本機開發

```bash
# 安裝
npm install

# 開發
npm run dev

# 執行打包
npm run build

# 打包後，執行預覽
npm run preview
```

### 開發網址

<!-- - blockMirror：<http://localhost:5173/problems>
- 教師
  - 管理畫面：<http://localhost:5173/dashboard>
- 學生
  - 題目清單：<http://localhost:5173/main>
  - 個人資料：<http://localhost:5173/main/user>
- 測試
  - i18n：<http://localhost:5173/_test/i18n>
  - Toast UI Editor：<http://localhost:5173/_test/editor>
  - CodeMirror 6：<http://localhost:5173/_test/codemirror> -->

### 部署更新時間

<!-- 檢查部署更新時間，打開網頁開發者工具，html 元素上，可查看 data-time 屬性。 -->

### i18n

<!-- 1. 在 [i18n/index.ts](src/i18n/index.ts) 處理 `vue-i18n`、`lit localization`、`blockly` 的語系設定，並提供 api。
2. vue-router 呼叫 i18n api，來設定語系。 -->

### Lit Element

<!-- - i18n
  - [官方說明](https://lit.dev/docs/localization/overview/)，選擇 `runtime mode`。
  - 建立步驟
    1. 透過 gulp，監控 lit element 檔案，產生 xliff 檔案。
    2. xliff 檔案，是將 lit element 中，符合規則的字串，轉成 xliff 格式而來。
    3. xliff 檔案，將翻譯好的字串，填入。
    4. 透過 gulp，監控 xliff 資料夾，執行 `lit-localize build`，將 xliff 檔案轉成 js 檔案。
  - `lit-localize build` 會參考設定檔內容 [lit-localize.json](lit-localize.json)。 -->

### VSCode

建議可安裝套件

- <https://marketplace.visualstudio.com/items?itemName=Vue.volar>
- <https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin>

### 注意

在 Volar 套件，說明中，有要求關閉 vscode 內建的 typescript 功能，可見套件說明，或是參考[官方連結](https://vuejs.org/guide/typescript/overview.html#volar-takeover-mode)。
