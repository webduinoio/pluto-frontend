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


## 開發指南
- index.html 是思維工具的入口頁面
- prod/html/gptbot.html 是思維工具的 GPT 頁面
- 部署網頁在 /mnt/i32g-nfs/chat-frontend/public/ 目錄下
- 串接後端 chat.node.redip 思維工具
  - 使用的是 BaseActor 的架構


## 這段程式碼主要定義了一組「演員」（Actor）類別，目的是構建一個以大型語言模型（LLM）為核心，能夠處理多種任務（例如對話、JSON 處理、文件檢索、表格查詢等）的系統。程式碼利用了外部庫（例如 LangChain、Pinecone、OpenAI、Anthropic 等）來組織記憶、提示模板、對話鏈、向量數據庫檢索，以及串流回應等功能。下面將分別說明各個主要類別的功能與用途：

---

### 1. **BaseActor 類別**

- **功能與用途：**
  - 作為所有演員的基礎類別，封裝了與 LLM 互動的基本邏輯。
  - 根據指定的模型名稱（如 `"gpt-..."` 或 `"claude-..."`）動態選擇使用 OpenAI 或 Anthropic 的聊天模型，並設定串流輸出、溫度等參數。
  - 利用外部庫建立了一個對話鏈（`ConversationChain`），並結合了記憶模組（`BufferWindowMemory`）與提示模板（`ChatPromptTemplate`），從而可以在多輪對話中保留歷史上下文。
  - 提供了 `prompt` 方法，將用戶輸入傳遞給 LLM 並通過回調函數實時返回生成的文本（實現類似串流式回應）。
  - 實現了 `similaritySearch` 方法，透過向量數據庫（由 `VectorDB` 封裝）進行相似度檢索，從而獲取與用戶問題相關的參考資料。

---

### 2. **JSONActor 類別**

- **功能與用途：**
  - 繼承自 `BaseActor`，專門用於處理 JSON 格式的輸入與輸出。
  - 在 `prompt` 方法中，首先將輸入的 JSON 字符串解析為物件，然後根據其中指定的「assistant」字段，從全局知識庫（`global.get("actor_knowbase")`）中獲取相應的命名空間。
  - 使用預先定義好的流程處理對象（`processObj`），先將 JSON 數據轉換為 LLM 能夠理解的提示（user prompt），再將 LLM 的回應進行特定處理後返回。
  - 適合用於結合結構化數據與 LLM 進行自動化任務處理，如根據 JSON 結構化描述來生成合適的回答或操作。

---

### 3. **ConversationActor 類別**

- **功能與用途：**
  - 同樣繼承自 `BaseActor`，專注於對話檢索式問答任務。
  - 結合了對話歷史（`this.history`）、上下文壓縮提示（condense prompt）以及問答提示（QA prompt），構建了一個多輪對話檢索問答系統。
  - 在 `makeChain` 方法中，利用 OpenAI 模型（使用串流回調處理中文標點符號作為斷句依據）和向量檢索（通過傳入的 `vector` 參數）構造了 `ConversationalRetrievalQAChain`。
  - `question` 方法會先對用戶問題進行預處理（如去除換行符），然後調用鏈條，最終將檢索到的相關文檔信息（來源、頁碼、圖片等）格式化後附加到回答中。
  - 適合用於需要從大規模文檔中檢索信息並進行上下文問答的應用場景。

---

### 4. **SheetActor 與 SheetDB 類別**

- **SheetActor：**
  - 同樣基於 `BaseActor`，專門處理與電子表格（Sheet）有關的查詢。
  - 在 `prompt` 方法中，將輸入字串按格式拆分為表格名稱、表格 URL 與查詢內容，並進一步調用 `invokePrompt` 方法。
  - `invokePrompt` 方法會創建一個 `SheetDB` 實例，並通過該實例對表格數據進行查詢處理。

- **SheetDB：**
  - 用於從指定的 Google Sheets（透過 Google Apps Script 提供的接口）獲取 JSON 格式的表格數據。
  - 將獲取到的數據讀入到內存中的 SQLite 資料庫中，根據表格的第一行建立資料表，並插入後續數據。
  - 構造了一個查詢模板，將表格結構信息、欄位資訊、部分數據範例等作為上下文，然後利用 LLM（通過 `actor.prompt`）生成合適的 SQL 查詢語句。
  - 執行生成的 SQL 語句並將結果進行格式化返回，從而實現對表格數據的智能查詢。
  - 該模塊適合用於結合 LLM 自動生成 SQL 語句並對表格數據進行查詢與分析的應用場景。

---

### 5. **VectorDB 類別**

- **功能與用途：**
  - 封裝了與向量數據庫（使用 Pinecone）的交互，用於文本向量化與相似度檢索。
  - 在 `init` 方法中，利用 OpenAIEmbeddings 將文本轉換為向量，並從已有的 Pinecone 索引中構建一個向量存儲實例。
  - `similaritySearch` 方法接受用戶問題，利用向量檢索（`similaritySearchWithScore`）找出相關文檔片段，並根據分數、字數上限進行組合後返回。
  - 還提供了 `listDocuments` 方法，可以列出命名空間下所有有來源標記的文檔，便於管理與檢索。
  - 此類別主要用於輔助對話、問答等場景中根據用戶查詢從知識庫中檢索相關內容。

---

### 6. **全局導出**

- 最後，程式碼通過 `global.set("class", { ... })` 將 `BaseActor`、`JSONActor`、`SheetActor` 與 `VectorDB` 這些類別註冊到全局對象中，方便系統其它部分調用和擴展。

---

### **綜合用途**

整個程式架構設計目標是搭建一個多模塊、多任務的 LLM 應用平臺，具體應用包括：

- **對話系統**：通過 `BaseActor` 與 `ConversationActor`，實現記憶上下文、串流回應的智能對話，並可結合向量檢索技術回答專業領域問題。
- **結構化 JSON 任務處理**：利用 `JSONActor` 處理以 JSON 為結構的指令，將格式化信息轉換成 LLM 可讀提示，再解析 LLM 回應。
- **表格數據查詢**：通過 `SheetActor` 與 `SheetDB`，實現從 Google Sheets 中提取數據、構造 SQLite 資料庫，並利用 LLM 自動生成 SQL 查詢來進行數據檢索與分析。
- **向量檢索與知識庫查詢**：借助 `VectorDB` 與 Pinecone，將文檔進行向量化存儲，並支持根據用戶問題檢索相關知識片段，從而增強對話回答的參考依據。

總結來說，這段程式碼展示了一個模塊化、可擴展的 LLM 應用設計，不僅實現了基本的對話功能，還結合了數據庫查詢和向量檢索，能夠應對複雜多樣的應用場景。