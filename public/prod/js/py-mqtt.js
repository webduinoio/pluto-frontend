class MQTTApp {
  constructor(userId) {
    this.userId = userId;
    this.client = new Paho.Client("wss://mqtt1.webduino.io/mqtt", userId);
    this.options = {
      reconnect: true,
      timeout: 900,
      keepAliveInterval: 30,
      userName: "webduino",
      password: "webduino",
    };
    this.subscriptions = {}; // 存儲訂閱關係的對象
  }

  async connect() {
    this.onConnectPromise = new Promise((resolve, reject) => {
      this.client.connect({
        ...this.options,
        onSuccess: () => {
          console.log("Connected to MQTT broker");
          resolve();
        },
        onFailure: (err) => {
          console.log("Failed to connect to MQTT broker:", err);
          reject(err);
        },
      });
    });
    await this.onConnectPromise;
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
  }

  // MQTT message publish function
  publish(msg) {
    var payload = new Paho.Message(msg);
    payload.destinationName = this.pubTopic;
    this.client.send(payload);
    console.log("Published message: " + msg);
  }

  // MQTT message publish function
  async publishTopic(topic, msg) {
    var payload = new Paho.Message(msg);
    payload.destinationName = topic;
    this.client.send(payload);
  }

  // MQTT message subscribe function
  subscribe(topic, onMessageReceived) {
    console.log("subscribe topic: " + topic);
    if (!this.subscriptions[topic]) {
      this.subscriptions[topic] = {
        onMessageReceived: onMessageReceived,
      };
      this.client.subscribe(topic);
      //console.log(`Subscribed to topic: ${topic}`);
    } else {
      console.warn(`Already subscribed to topic: ${topic}`);
    }
  }

  // MQTT message received handler
  onMessageArrived(message) {
    const topic = message.destinationName;
    const payload = message.payloadString;
    if (
      this.subscriptions[topic] &&
      this.subscriptions[topic].onMessageReceived
    ) {
      this.subscriptions[topic].onMessageReceived(payload);
    }
  }
}
