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

const generateUploadCode = (type, file, pythonCode) => {
  code = `
pycode = """
${pythonCode}
"""
from Maix import utils
from time import sleep
import gc, machine, ujson
# write python code
with open('${file}', 'w') as f:
    f.write(pycode)
sleep(0.5)
with open ('${file}', 'r') as f:
    content = f.read()
# save firmware type
romFlagAddressStart = 0x1FFFF
preFlag = int.from_bytes(utils.flash_read(romFlagAddressStart, 1), "big")
romFlag = 1 if "${type}" == "mini" else 0
if preFlag != romFlag:
    utils.flash_write(romFlagAddressStart, bytes([romFlag]))
deployCmd = '_DEPLOY/{"url":"local"}'
cfg.init()
cfg.put('cmd', deployCmd)
`;
  return code;
};

const snapshotESP32Code = `
import camera,sys
if not 'cameraStatus' in locals():
  camera.init(0, format=camera.JPEG,xclk_freq=camera.XCLK_20MHz)
  camera.framesize(15)
  camera.framesize(camera.FRAME_SVGA)
  camera.quality(10)
  cameraStatus = True
jpg = camera.capture()
sys.stdout.write("JPGSize:")
sys.stdout.write(str(len(jpg)))
sys.stdout.write('\\r\\n')
`

const snapshotK210Code = `
from webai import *
from time import sleep
webai.init()
webai.lcd.init()
repl = UART.repl_uart()
img = webai.snapshot()
webai.show(img=img)
jpg = img.compress(80)
img = None
jpg = jpg.to_bytes()
repl.write("JPGSize:")
repl.write(str(len(jpg)))
repl.write('\\r\\n')
`

class DataTransformer {
  constructor() {
    this.container = '';
    this.decoder = new TextDecoder();
    this.readLine = true;
    this.readByteArray = false;
  }

  setReadLine() {
    this.readLine = true;
    this.readByteArray = false;
  }

  setReadByteArray(bytes) {
    this.readLine = false;
    this.readByteArray = true;
    this.byteArray = new Uint8Array();
    this.OK = false;
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
      // check endof ArrayBuffer 0x04 , 0x04 , 62
      var endSign = chunk.slice(chunk.length - 3);
      if (endSign[0] == 4 && endSign[1] == 4 && endSign[2] == 62) {
        var allData = new Uint8Array([...this.byteArray.slice(0, byteArrayLength - 3)]);
        var rtnData = [];
        var start = false;
        // find startPos '>OK'
        for (var i = 0; i < allData.length; i++) {
          if (!start) {
            if (allData[i] == 0x3e
              && allData[i + 1] == 0x4f
              && allData[i + 2] == 0x4b) {
              i = i + 2;
              start = true;
              continue;
            }
          } else {
            if (allData[i] == 0x0d && allData[i + 1] == 0x0a) {
              continue;
            } else {
              rtnData.push(allData[i]);
            }
          }
        }
        rtnData = new Uint8Array(rtnData);
        controller.enqueue(rtnData);
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
    const filter = { usbVendorId: 6790 };
    if (self.port == undefined) {
      self.port = await navigator.serial.requestPort({ /*filters: [filter]*/ });
      await this.port.open({ baudRate: 115200, dateBits: 8, stopBits: 1, });
      this.writer = this.port.writable.getWriter();
      this.stream = new DataTransformer();
      this.reader = this.port.readable.
        pipeThrough(new TransformStream(this.stream)).getReader();
      self.port.ondisconnect = function () {
        console.log("disconnect port");
        self.port = null;
      }
    }
  }

  async restart(chip) {
    for (var i = 0; i < 30; i++) {
      await this.port.setSignals({ dataTerminalReady: false });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await this.port.setSignals({ dataTerminalReady: true });
    }
    if (chip != 'esp32') {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } else {
      console.log("esp32 restart")
    }
    console.log("restart ok")
  }

  async enter(chip) {
    await this.restart(chip);
    for (var i = 0; i < 100; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      await this.writer.write(Int8Array.from([0x03 /*interrupt*/]));
    }
    var { value, done } = await this.reader.read();
    console.log("clear boot data");
  }

  async write(code, cb) {
    var boundry = "===" + Math.random() + "==";
    await this.writer.write(Int8Array.from([0x01 /*RAW paste mode*/]));
    code = "\r\nprint('" + boundry + "')\r\n" + code;
    code = code + "\r\nprint('" + boundry + "')\r\n";
    await this.writer.write(this.encoder.encode(code));
    await this.writer.write(Int8Array.from([0x04 /*exit*/]));
    var startBoundry = false;
    var rtnObj = "" + code.length;
    while (true) {
      var { value, done } = await this.reader.read();
      if (this.stream.readLine) {
        if (value == ">OK" + boundry) {
          //console.log("startBoundry....");
          startBoundry = true;
          continue;
        }
        if (value == boundry) {
          //console.log("endBoundry , rtnObj:", rtnObj);
          return rtnObj;
        } else if (startBoundry && cb != null) {
          var { value, done } = await cb(value);
          if (done) return value;
        }
      }
      if (this.stream.readByteArray) {
        var { value, done } = await cb(value, true);
        if (done) return value;
      }
    }
  }

  async uploadFile(type, filename, pythonCode) {
    if (type == 'esp32') {
      pythonCode = generateESP32UploadCode(filename, pythonCode);
      pythonCode = pythonCode.replaceAll("\\", "\\\\");
      var rtn = await this.write(pythonCode, function (value) {
        if (value.substring(0, 4) == 'save') {
          return { 'value': value, 'done': true };
        }
      });
      return rtn;
    } else {
      pythonCode = generateUploadCode(type /*std|mini*/, filename, pythonCode);
      pythonCode = pythonCode.replaceAll("\\", "\\\\");
      return await this.write(pythonCode, function (value) {
        if (value.substring(0, 4) == 'save') {
          return { 'value': value, 'done': true };
        }
      });
    }
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

  async snapshot(chip) {
    this.stream.setReadLine();
    var code = chip == 'k210' ? snapshotK210Code : snapshotESP32Code;
    //console.log(">>>", code);
    var imgSize = await this.write(code,
      async function (value) {
        console.log("value>>", value);
        if (value.substring(0, 8) == 'JPGSize:') {
          value = parseInt(value.substring(8));
          return { 'value': value, 'done': true }
        } else {
          return { 'value': value, 'done': false }
        }
      });
    await this.reader.read();
    console.log("size:", imgSize);
    await this.writer.write(Int8Array.from([0x01 /*RAW paste mode*/]));
    var cmd = chip == 'k210' ? "repl.write(jpg)" : "sys.stdout.write(jpg)";
    await this.writer.write(this.encoder.encode(cmd));
    await this.writer.write(Int8Array.from([0x04 /*exit*/]));
    var urlCreator = window.URL || window.webkitURL;
    this.stream.setReadByteArray(parseInt(imgSize));
    var { value, done } = await this.reader.read();
    var jpg = new Blob([value], { type: "image/jpeg" });
    return urlCreator.createObjectURL(jpg);
  }

}