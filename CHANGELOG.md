# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 新增搜尋欄功能 - API [#8036](https://redmine.kingkit.codes/issues/8036)

## [1.11.2] - 2024.2.29

### Fixed

- 小助教索引文字問題 [#7652](https://redmine.kingkit.codes/issues/7652)

## [1.11.1] - 2024.2.20

### Changed

- 調整台天資料 [#7608](https://redmine.kingkit.codes/issues/7608)
- 調整語音輸入按鈕的位置 [#7630](https://redmine.kingkit.codes/issues/7630)

## [1.11.0] - 2023.11.07

### Added

- 小助教按讚和倒讚 [#7301](https://redmine.kingkit.codes/issues/7301)

### Fixed

- prompt 模板角色設定欄位異常 [#7379](https://redmine.kingkit.codes/issues/7379)

## [1.10.1] - 2023.10.27

### Changed

- 前端針對小助教回答逾時作錯誤處理 part2 [#7365](https://redmine.kingkit.codes/issues/7365)
- 小助教上傳封面圖片失敗 - 前端調整 [#7369](https://redmine.kingkit.codes/issues/7369)

## [1.10.0] - 2023.10.25

### Added

- 進階設定新增 Prompt 模板 [#7264](https://redmine.kingkit.codes/issues/7264)

### Fixed

- 平板編輯小助教標籤切換異常 [#7350](https://redmine.kingkit.codes/issues/7350)
- 問題輸入換行無效 [#7311](https://redmine.kingkit.codes/issues/7311)

### Changed

- 前端針對小助教回答逾時作錯誤處理 [#7346](https://redmine.kingkit.codes/issues/7346)

## [1.9.1] - 2023.10.18

### Changed

- 解析 PDF 文字間插入多餘空白 [#7318](https://redmine.kingkit.codes/issues/7318)
- 更改小助教預設的 prompt [#7335](https://redmine.kingkit.codes/issues/7335)

### Fixed

- 修正點擊引用標籤的問題(NaN,圖片連結) [#7243](https://redmine.kingkit.codes/issues/7243)
- 索引標籤使用 7 個中文字或 7 個單詞 [#7243](https://redmine.kingkit.codes/issues/7243)
- 點擊引用標籤，頁數會變成 NaN [#7243](https://redmine.kingkit.codes/issues/7243)
- 刻意刪除副檔名 `.pdf` 訓練會發生錯誤 [#7250](https://redmine.kingkit.codes/issues/7250)

### Changed

- 小助教 meta data [#7332](https://redmine.kingkit.codes/issues/7332)

## [1.9.0] - 2023.10.11

### Changed

- RWD - 小助教清單 [#7272](https://redmine.kingkit.codes/issues/7272)
- RWD - 建立小助教 [#7273](https://redmine.kingkit.codes/issues/7273)
- RWD - 額度已滿畫面 [#7275](https://redmine.kingkit.codes/issues/7275)
- RWD - 小助教聊天畫面 [#7274](https://redmine.kingkit.codes/issues/7274)
- 小書僮更名 [#7266](https://redmine.kingkit.codes/issues/7266)
- 修正 PDF 檔案下載與顯示 [#7250](https://redmine.kingkit.codes/issues/7250)
- 快速切換 PDF 檔案會讓頁數異常 [#7238](https://redmine.kingkit.codes/issues/7238)
- 優化提醒登入的文字 [#7289](https://redmine.kingkit.codes/issues/7289)

### Fixed

- 刪除小書僮後清單無法顯示全部小書僮 [#7241](https://redmine.kingkit.codes/issues/7241)
- header 在 ipad 顯示異常 [#7295](https://redmine.kingkit.codes/issues/7295)

## [1.8.0] - 2023.09.28

### Added

- 小書僮 meta data [#7203](https://redmine.kingkit.codes/issues/7203)
- 增加智財權提醒文字 [#7209](https://redmine.kingkit.codes/issues/7209)

### Changed

- 修改檔案上限的提示文字 [#7244](https://redmine.kingkit.codes/issues/7244)
- 更改訓練資料說明連結 [#7257](https://redmine.kingkit.codes/issues/7257)

## [1.7.0] - 2023.09.16

### Changed

- 小書僮清單分類、搜尋 [#7175](https://redmine.kingkit.codes/issues/7175)
- 保存 UTM 參數 [#7232](https://redmine.kingkit.codes/issues/7232)

## [1.6.0] - 2023.09.12

### Changed

- 串接後端來限制免費版、付費版每日可用問題數 [#7134](https://redmine.kingkit.codes/issues/7134)
- 小書僮 UI UX 調整 [#7213](https://redmine.kingkit.codes/issues/7213)

## [1.5.1] - 2023.09.07

### Fixed

- 小書僮清單重複 [#7211](https://redmine.kingkit.codes/issues/7211)

## [1.5.0] - 2023-09-06

### Fixed

- 小書僮回答和引用資料不符（張震嶽）[#7156](https://redmine.kingkit.codes/issues/7156)
- 引用標籤無法點擊[#7159](https://redmine.kingkit.codes/issues/7159)
- PDF 字型找不到[#7172](https://redmine.kingkit.codes/issues/7172)
- 點擊引用標籤文件沒有滾到指定段落[#7178](https://redmine.kingkit.codes/issues/7178)
- PDF Viewer 無法輸入頁數[#7194](https://redmine.kingkit.codes/issues/7194)

### Added

- 限制免費版、付費版檔案大小和頁數[#7098](https://redmine.kingkit.codes/issues/7098)
- 後端自動將文件取摘要[#7116](https://redmine.kingkit.codes/issues/7116)
- 小書僮支援 Infinity Scroll[#7180](https://redmine.kingkit.codes/issues/7180)

### Changed

- 小書僮微調 [#7208](https://redmine.kingkit.codes/issues/7208)

## [1.4.0] - 2023-08-28

### Fixed

- 輸入頁數會導致頁數顯示異常[#7179](https://redmine.kingkit.codes/issues/7179)

### Added

- 小書僮帳號角色區隔 [#7007](https://redmine.kingkit.codes/issues/7007)
- 小書僮免費、付費版機制 [#7091](https://redmine.kingkit.codes/issues/7091)
- 自動將文件取摘要前端實作 [#7117](https://redmine.kingkit.codes/issues/7117)
- 小書僮登入流程優化 [#7118](https://redmine.kingkit.codes/issues/7118)
- 小書僮埋設 GTM 代碼 [#7153](https://redmine.kingkit.codes/issues/7153)

## [1.3.1] - 2023-08-14

### Fixed

- 小書僮引用資料和回答無關 [#7140](https://redmine.kingkit.codes/issues/7140)
- 點擊引用標籤會讓頁數顯示異常 [#7141](https://redmine.kingkit.codes/issues/7141)
- 點擊引用標籤，下拉選單沒有切換對應檔案 [#7142](https://redmine.kingkit.codes/issues/7142)

## [1.3.0] - 2023-08-11

### Fixed

- PDF 放大、縮小、跳頁、全文檢索（ UI 優化 2 ） [#7133](https://redmine.kingkit.codes/issues/7133)

## [1.2.0] - 2023-08-04

### Added

- PDF 預覽功能 [#7062](https://redmine.kingkit.codes/issues/7062)
- PDF 自動擷取整段落反白功能 [#7089](https://redmine.kingkit.codes/issues/7089)
- 讓圖片可以顯示在小書僮回答中 [#7113](https://redmine.kingkit.codes/issues/7113)
- 小書僮圖片可以顯示在凱比臉上 [#7060](https://redmine.kingkit.codes/issues/7060)

### Fixed

- 小書僮閒置一段時間會斷線 [#7065](https://redmine.kingkit.codes/issues/7065)
- PDF 字模糊(參考資料) [#7088](https://redmine.kingkit.codes/issues/7113)
- PDF 索引斷字問題 (找不到索引資料) [#7086](https://redmine.kingkit.codes/issues/7086)
- PDF 縮放、跳頁、全文檢索（ UI 優化 ）[#7112](https://redmine.kingkit.codes/issues/7112)

### Changed

- PDF 檔案下載加速 [#7087](https://redmine.kingkit.codes/issues/7087)

## [1.0.0-alpha.1] - 2023-08-02

### Added

- 小書僮狀態 [#7032](https://redmine.kingkit.codes/issues/7032)
- 顯示小書僮 ID [#7059](https://redmine.kingkit.codes/issues/7059)
- 上傳檔案限制 [#7061](https://redmine.kingkit.codes/issues/7061)
- 小書僮小地方優化 [#7080](https://redmine.kingkit.codes/issues/7080)
- 已分享的小書僮，在清單顯示 icon [#7102](https://redmine.kingkit.codes/issues/7102)

### Fixed

- 小書僮 Q&A 無法編輯 [#7085](https://redmine.kingkit.codes/issues/7085)
- 小書僮 icon 亂碼 [#7111](https://redmine.kingkit.codes/issues/7111)

## [1.0.0-alpha] - 2023-07-11

### Added

- 小書僮清單 - ui [#6957](https://redmine.kingkit.codes/issues/6957)
- 新增小書僮 - ui [#6958](https://redmine.kingkit.codes/issues/6958)
- 編輯書僮 - 資料管理 ui [#6961](https://redmine.kingkit.codes/issues/6961)
- 問答小書僮 [#6944](https://redmine.kingkit.codes/issues/6944)
- 出題小書僮 [#6943](https://redmine.kingkit.codes/issues/6943)
- 試算表小書僮 [#6945](https://redmine.kingkit.codes/issues/6945)
- OAuth 登入 [#6936](https://redmine.kingkit.codes/issues/6936)
- 編輯書僮 - 設定 ui [#6959](https://redmine.kingkit.codes/issues/6959)
- 編輯書僮 - 進階設定 ui [#6960](https://redmine.kingkit.codes/issues/6960)
- 聊天畫面放範例 prompt [#7002](https://redmine.kingkit.codes/issues/7002)
- 分享連結 [#6949](https://redmine.kingkit.codes/issues/6949)

### Changed

- 調整送出訊息的格式 [#7028](https://redmine.kingkit.codes/issues/7028)

### Fixed

- 問題回復處理 [#7029](https://redmine.kingkit.codes/issues/7029)
- 小書僮清單卡片樣式跑掉 [#6983](https://redmine.kingkit.codes/issues/6983)

[Unreleased]: https://github.com/webduinoio/pluto-frontend/compare/v1.11.2...HEAD
[1.11.2]: https://github.com/webduinoio/pluto-frontend/compare/v1.10.1...v1.11.2
[1.11.1]: https://github.com/webduinoio/pluto-frontend/compare/v1.10.1...v1.11.1
[1.11.0]: https://github.com/webduinoio/pluto-frontend/compare/v1.10.1...v1.11.0
[1.10.1]: https://github.com/webduinoio/pluto-frontend/compare/v1.10.0...v1.10.1
[1.10.0]: https://github.com/webduinoio/pluto-frontend/compare/v1.9.1...v1.10.0
[1.9.1]: https://github.com/webduinoio/pluto-frontend/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/webduinoio/pluto-frontend/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/webduinoio/pluto-frontend/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/webduinoio/pluto-frontend/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/webduinoio/pluto-frontend/compare/v1.5.1...v1.6.0
[1.5.1]: https://github.com/webduinoio/pluto-frontend/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/webduinoio/pluto-frontend/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/webduinoio/pluto-frontend/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/webduinoio/pluto-frontend/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/webduinoio/pluto-frontend/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/webduinoio/pluto-frontend/compare/v1.0.0-alpha.1...v1.2.0
[1.0.0-alpha.1]: https://github.com/webduinoio/pluto-frontend/compare/v1.0.0-alpha...v1.0.0-alpha.1
[1.0.0-alpha]: https://github.com/webduinoio/pluto-frontend/releases/tag/v1.0.0-alpha
