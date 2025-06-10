class Burn {
  constructor() {
    this.espTool = new EspLoader({
      updateProgress: this.updateProgress,
      logMsg: this.logMsg
    });
  }

  async connect(baudrate) {
    await this.espTool.connect();
    this.readLoop().catch((error) => {
      console.log("err:", error);
    });
    try {
      if (await this.espTool.sync()) {
        this.logMsg("connected");
        this.logMsg("Connected to " + await this.espTool.chipName());
        this.logMsg("MAC Address: " + this.formatMacAddr(this.espTool.macAddr()));
        this.espTool = await this.espTool.runStub();
        await this.espTool.setBaudrate(baudrate);
      }
    } catch (e) {
      console.log("Error:", e);
      await disconnect();
      return;
    }
  }

  async erase() {
    this.logMsg("Erasing flash memory. Please wait...");
    let stamp = Date.now();
    await this.espTool.eraseFlash();
    this.logMsg("Finished. Took " + (Date.now() - stamp) + "ms to erase.");
  }

  async flash(urlFiles, cb) {
    this.espTool.updateProgress = cb;
    var fileArr = [];
    for (var i = 0; i < urlFiles.length; i++) {
      var fileObj = await this.getFile(urlFiles[i][0], urlFiles[i][1]);
      fileArr.push(fileObj);
    }
    var part = 0;
    for (let file of fileArr) {
      let contents = file.data;
      let offset = file.address;
      await this.espTool.flashData(contents, offset, ++part);
      await this.sleep(100);
    }
    this.logMsg("To run the new firmware, please reset your device.");
  }

  async getFile(url, addrOffset) {
    return await fetch(url, {
      mode: 'cors'
    }).then(res => {
      return res.arrayBuffer();
    }).then(buf => {
      return { data: buf, address: addrOffset }
    });
  };

  updateProgress(part, percentage) {
    console.log("part:", part, " , percentage:", percentage);
    this.progressCallback(part, percentage);
  }

  logMsg(text) {
    console.log("log:", text);
  }

  formatMacAddr(macAddr) {
    return macAddr.map(value => value.toString(16).toUpperCase().padStart(2, "0")).join(":");
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async readLoop() {
    reader = port.readable.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        reader.releaseLock();
        break;
      }
      inputBuffer = inputBuffer.concat(Array.from(value));
    }
  }

}

var burn = new Burn();

btnPython.addEventListener('click', async () => {
  msg.innerHTML = 'USB 連線中...';
  await burn.connect(230400);
  msg.innerHTML = '清除約需15秒，請稍候...';
  await burn.erase();
  msg.innerHTML = '清除完成';
  msg.innerHTML = '燒錄中，請稍候...';
  progressShow();
  console.log("load files...");
  var fileArr = [
    ['board/webbitv2/fw_mpy/v2_2025-06-10.bin', 0x0]
  ]
  console.log("OK!");
  await burn.flash(fileArr, function (part, percent) {
    if (part == fileArr.length) {
      progressSet(percent);
    }
  });
  msg.innerHTML = '燒錄完成';
  pythonReady2go.style['display'] = '';
});


btnBlockly.addEventListener('click', async () => {
  msg.innerHTML = 'USB 連線中...';
  await burn.connect(230400);
  msg.innerHTML = '清除約需15秒，請稍候...';
  await burn.erase();
  msg.innerHTML = '清除完成';
  msg.innerHTML = '燒錄中，請稍候...';
  progressShow();
  console.log("load files...");
  var fileArr = [
    ['board/webbitv2/fw_mpy/v2_2025-06-10.bin', 0x0]
  ];
  console.log("OK!");
  await burn.flash(fileArr, function (part, percent) {
    if (part == fileArr.length) {
      progressSet(percent);
    }
  });
  msg.innerHTML = '燒錄完成';
  blocklyReady2go.style['display'] = '';
});
