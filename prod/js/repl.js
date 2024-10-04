/*
以下是提供給其他程式調用的 API 清單，主要包括 `generateESP32UploadCode` 函數和 `REPL` 類別的方法：

### 函數

1. **`generateESP32UploadCode(file, pythonCode)`**
   - **描述**: 生成用於上傳至 ESP32 的 Python 程式碼。此程式碼會將提供的 `pythonCode` 寫入指定的 `file`，然後讀取該檔案的內容。
   - **參數**:
     - `file` (字串): 要寫入的檔案名稱，例如 `'main.py'`。
     - `pythonCode` (字串): 要上傳的 Python 程式碼。
   - **回傳值**: 字串形式的完整 Python 程式碼，用於在 ESP32 上執行。

### 類別 `REPL`

`REPL` 類別提供了一組方法，用於與 ESP32 進行串列通信和控制。以下是可供調用的主要方法：

1. **`new REPL()`**
   - **描述**: 創建一個新的 `REPL` 實例。

2. **`addListener(callback)`**
   - **描述**: 添加一個監聽器，用於處理來自 ESP32 的輸出。
   - **參數**:
     - `callback` (函數): 當有新的輸出時會被調用的回調函數。

3. **`usbConnect()`**
   - **描述**: 通過 USB 連接到 ESP32。此方法會請求使用者選擇串列端口，並設置讀寫器和讀取器。
   - **回傳值**: 無。

4. **`reset()`**
   - **描述**: 重置 ESP32 設備，觸發 `machine.reset()` 命令。
   - **回傳值**: 無。

5. **`enter()`**
   - **描述**: 進入 ESP32 的 REPL 模式。這通常涉及發送中斷信號以確保 REPL 可用。
   - **回傳值**: 無。

6. **`write(code, cb)`**
   - **描述**: 向 ESP32 的 REPL 發送 Python 程式碼，並可選擇性地處理回應。
   - **參數**:
     - `code` (字串): 要執行的 Python 程式碼。
     - `cb` (函數, 可選): 處理來自 ESP32 的輸出回調函數。
   - **回傳值**: 執行代碼的長度作為字串，或根據回調函數的返回值。

7. **`uploadFile(pythonCode)`**
   - **描述**: 上傳一個 Python 檔案 (`main.py`) 到 ESP32。此方法會生成上傳所需的 Python 程式碼，並通過 REPL 發送。
   - **參數**:
     - `pythonCode` (字串): 要上傳的 Python 程式碼。
   - **回傳值**: 上傳操作的結果。

8. **`setWiFi(pythonCode, ssid, pwd)`**
   - **描述**: 設置 ESP32 的 WiFi 設定。此方法會添加初始化配置和 WiFi 資訊到提供的 `pythonCode`，並通過 REPL 發送。
   - **參數**:
     - `pythonCode` (字串): 基礎的 Python 程式碼。
     - `ssid` (字串): WiFi 的 SSID。
     - `pwd` (字串): WiFi 的密碼。
   - **回傳值**: 設置 WiFi 的結果。

### 類別 `DataTransformer`（內部使用）

`DataTransformer` 類別主要用於處理從 ESP32 接收到的數據，根據需要將其轉換為行或位元組陣列。通常不需要外部程式直接調用，但了解其功能有助於理解 `REPL` 的運作。

1. **`setReadLine()`**
   - **描述**: 設置 `DataTransformer` 為行模式，逐行處理輸入數據。

2. **`setReadByteArray(bytes)`**
   - **描述**: 設置 `DataTransformer` 為位元組陣列模式，指定每次讀取的位元組數量。

3. **`transform(chunk, controller)`**
   - **描述**: 處理接收到的數據塊，根據當前模式（行或位元組陣列）進行轉換並將結果推送到控制器。

4. **`flush(controller)`**
   - **描述**: 在數據流結束時，將剩餘的數據推送到控制器。

### 總結

上述 API 提供了完整的接口，用於連接、控制和上傳程式碼到 ESP32。以下是常見的使用流程：

1. 創建 `REPL` 實例。
2. 使用 `usbConnect()` 連接到 ESP32。
3. 使用 `uploadFile(pythonCode)` 上傳程式碼。
4. 使用 `setWiFi(pythonCode, ssid, pwd)` 設置 WiFi。
5. 使用 `reset()` 重新啟動 ESP32 以應用更改。

這些 API 可以靈活地集成到其他 JavaScript 程式或應用中，以實現與 ESP32 的自動化互動和控制。

*/
const generateESP32UploadCode = (file, pythonCode) => {
  code = `
pycode = """
${pythonCode}
"""
import machine
# write python code
with open('${file}', 'w') as f:
    f.write(pycode)
with open ('${file}', 'r') as f:
    content = f.read()
`;
  return code;
};


class DataTransformer {
  constructor() {
    this.container = '';
    this.decoder = new TextDecoder();
    this.readLine = true;
  }

  setReadLine() {
    this.readLine = true;
    this.readByteArray = false;
  }

  setReadByteArray(bytes) {
    this.readLine = false;
    this.readByteArray = true;
    this.readBytes = bytes;
    this.byteArray = new Uint8Array();
  }

  transform(chunk, controller) {
    if (this.readLine) {
      chunk = this.decoder.decode(chunk);
      this.container += chunk;
      const lines = this.container.split('\r\n');
      this.container = lines.pop();
      lines.forEach(line => controller.enqueue(line));
    }
    if (this.readByteArray) {
      this.byteArray = new Uint8Array([...this.byteArray, ...chunk]);
      var byteArrayLength = this.byteArray.length;
      if (byteArrayLength >= this.readBytes) {
        var rtnByteArray = new Uint8Array([...this.byteArray.slice(0, this.readBytes)]);
        this.byteArray = new Uint8Array(
          [this.byteArray.slice(this.readBytes, byteArrayLength - this.readBytes)]);
        controller.enqueue(rtnByteArray);
      }
    }
  }

  flush(controller) {
    controller.enqueue(this.container);
  }
}

class REPL {
  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
    this.callback = function () { }
  }

  addListener(callback) {
    this.callback = callback;
  }

  async usbConnect() {
    var self = this;
    this.running = false;
    const filter = { usbVendorId: 6790 };
    if (self.port == undefined) {
      self.port = await navigator.serial.requestPort({});
      await this.port.open({ baudRate: 115200, dateBits: 8, stopBits: 1, });
      this.writer = this.port.writable.getWriter();
      this.stream = new DataTransformer();
      this.reader = this.port.readable.
        pipeThrough(new TransformStream(this.stream)).getReader();
      self.port.ondisconnect = function () {
        console.log("<<< disconnect port >>>");
        self.port = null;
      }
    }
    await self.enter();
  }

  async reset() {
    this.write('machine.reset()\n');
  }

  async enter() {
    //await this.restart(); // failure
    for (var i = 0; i < 3; i++) {
      await this.writer.write(Int8Array.from([0x03 /*interrupt*/]));
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log("REPL ready!");
  }

  async write(code, cb) {
    if (this.running) {
      if (cb != null)
        cb('running...');
      return "";
    }
    this.running = true;
    var boundry = "===" + Math.random() + "==";
    await this.writer.write(Int8Array.from([0x01 /*RAW paste mode*/]));

    await new Promise((resolve) => setTimeout(resolve, 5));
    await this.writer.write(this.encoder.encode("print('" + boundry + "')\r\n"));
    var codes = code.split('\n');
    for (var i = 0; i < codes.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5));
      await this.writer.write(this.encoder.encode(codes[i] + "\n"));
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
    await this.writer.write(this.encoder.encode("print('" + boundry + "')\r\n"));
    await new Promise((resolve) => setTimeout(resolve, 5));

    await this.writer.write(Int8Array.from([0x04 /*exit*/]));
    var startBoundry = false;
    var rtnObj = "" + code.length;
    try {
      while (true) {
        var { value, done } = await this.reader.read();
        if (this.stream.readLine) {
          if (done) {
            //console.log("end:",value);
            this.running = false;
            return rtnObj;
          } else if (value.indexOf(">raw REPL; CTRL-B to exit") > 0) {
            continue;
          } else if (value == ">OK" + boundry) {
            startBoundry = true;
            //console.log("startBoundry...",value);
            continue;
          } else if (value == boundry) {
            //console.log("endBoundry...",value);
            this.running = false;
            return rtnObj;
          } else if (startBoundry && cb != null) {
            //console.log("output...",value);
            var { value, done } = await cb(value);
            if (done) return value;
          }
        } else if (this.stream.readByteArray) {
          var { value, done } = await cb(value);
          if (done) {
            this.running = false;
            return value;
          }
        }
      }
    } catch (e) { }
  }

  async uploadFile(pythonCode) {
    pythonCode = generateESP32UploadCode('main.py', pythonCode);
    pythonCode = pythonCode.replace("\\", "\\\\");
    var rtn = await this.write(pythonCode, function (value) {
      if (value.substring(0, 4) == 'save') {
        return { 'value': value, 'done': true };
      }
    });
    this.reset();
    return rtn;
  }

  async setWiFi(pythonCode, ssid, pwd) {
    pythonCode += "cfg.init()\n";
    pythonCode += "cfg.put('wifi',{'ssid':'" + ssid + "','pwd':'" + pwd + "'})\n";
    return await this.write(pythonCode, function (value) {
      if (value.substring(0, 4) == 'save') {
        return { 'value': value, 'done': true };
      }
    });
  }

}