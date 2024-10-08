/**
 * 依照 python paho mqtt 的寫法
 * https://eclipse.dev/paho/files/paho.mqtt.python/html/client.html
 * https://shaocheng.li/posts/2017/05/23/
 * https://blog.csdn.net/weixin_41656968/article/details/80848542
 */

class MQTTApp {
  static #instances = [];

  constructor(userId) {
    this.userId = userId || "pyodide-" + Math.random(1000000);
    this.client = null;
    this.options = {
      reconnect: true,
      timeout: 900,
      keepAliveInterval: 30,
      userName: "webduino",
      password: "webduino",
    };
    this.on_connect = (client, userData, flags, rc) => {}; // 提供接口給外部使用
    this.on_disconnect = (client, userData, rc) => {}; // 提供接口給外部使用
    this.on_message = (client, userData, msg) => {}; // 提供接口給外部使用
    this.subscribeTopics = []; // [topic] 儲存未連線前的訂閱
    this.publishData = []; // [{topic, message}] 儲存未連線前的發佈
    this.userData = "";
  }

  static Client(clientId) {
    const inst = new MQTTApp(clientId ?? "pyodide-" + Math.random(1000000));
    this.#instances.push(inst);
    return inst;
  }

  static disconnectAll() {
    this.#instances.forEach((inst) => inst.disconnect());
    this.#instances = [];
  }

  #onMessageArrived(message) {
    const topic = message.destinationName;
    const payload = {
      decode: () => message.payloadString,
    };
    
    this.on_message(this, this.userData, {
      topic: topic,
      payload: payload,
    });
  }

  username_pw_set(user, password) {
    this.options.userName = user;
    this.options.password = password;
  }

  #onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:" + responseObject.errorMessage);
    }
    this.on_disconnect(this, this.userData, 0);
  }

  async connect(uri, port, keepAlive = 30) {
    if (port > 0) {
      this.client = new Paho.Client(uri, port, this.userId);
    } else {
      this.client = new Paho.Client(uri, this.userId);
    }

    this.options.keepAliveInterval = keepAlive;

    this.onConnectPromise = new Promise((resolve, reject) => {
      this.client.connect({
        ...this.options,
        onSuccess: () => {
          console.log("Connected to MQTT broker");

          if (this.subscribeTopics.length > 0) {
            this.subscribeTopics.forEach((topic) => {
              this.client.subscribe(topic);
            });
            this.subscribeTopics = [];
          }

          if (this.publishData.length > 0) {
            this.publishData.forEach((data) => {
              this.publish(data.topic, data.message);
            });
            this.publishData = [];
          }

          this.on_connect(this, this.userData, "", 0);
          resolve();
        },
        onFailure: (err) => {
          console.log("Failed to connect to MQTT broker:", err);
          reject(err);
        },
      });
    });
    await this.onConnectPromise;
    this.client.onMessageArrived = this.#onMessageArrived.bind(this);
    this.client.onConnectionLost = this.#onConnectionLost.bind(this);
  }

  subscribe(topic) {
    if (this.client.isConnected()) {
      this.client.subscribe(topic);
    } else {
      this.subscribeTopics.push(topic);
    }
  }

  publish(topic, msg) {
    if (this.client.isConnected()) {
      const payload = new Paho.Message(msg);
      payload.destinationName = topic;
      this.client.send(payload);
    } else {
      this.publishData.push({ topic, message: msg });
    }
  }

  loop() {
    // 仿 python 作法，暫無用途
  }

  loop_forever() {
    // 仿 python 作法，暫無用途
  }

  user_data_set(value) {
    this.userData = value;
  }

  disconnect() {
    this.client?.disconnect();
  }
}

export default MQTTApp;
