pluto-frontend
==============

思維工具

本機開發
--------

### 安裝

```bash
npm install
```

若為 MAC M1 系統，請使用以下指令安裝

```bash
arch -x86_64 /bin/zsh -c "source ~/.zshrc && npm install"
```

### 開發

啟動環境

```bash
npx http-server

# 或是
server .
```

有需要處理 blockMirror 的話，可以啟動以下指令

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run watch
```

打開瀏覽器，輸入 `http://localhost:8080` 即可看到畫面

開發分之說明
------------

| 名稱    | 用途              |
| ------- | ----------------- |
| develop | 思維工具測試機    |
| main    | 思維工具正式機    |
| aitsky  | 思維工具台天版    |
| egame   | 思維工具 Egame 版 |
| next    | 小助教測試機      |
| tutor   | 小助教正式機      |
