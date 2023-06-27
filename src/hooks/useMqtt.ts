class MQTTApp {
  userId: string;
  client: any;
  options: any;
  pubTopic: string;
  respTopic_cb: string;
  respTopic_end: string;
  onConnectPromise: any;
  subscriptions: any;
  failure: boolean;

  constructor(userId: string) {
    this.userId = userId;
    this.client = new Paho.Client('wss://mqtt1.webduino.io/mqtt', userId);
    this.options = {
      reconnect: true,
      timeout: 900,
      keepAliveInterval: 30,
      userName: 'webduino',
      password: 'webduino',
    };
    this.onConnectPromise = null;
    this.subscriptions = {}; // 存儲訂閱關係的對象
    const topic = 'kn@chat-staging'; // 測試機
    this.pubTopic = topic + '_prompt/' + userId;
    this.respTopic_cb = topic + '_completion/' + this.userId;
    this.respTopic_end = topic + '_completion_end/' + this.userId;
    this.failure = false;
  }

  async init(cb: Function) {
    await this.connect();
    this.subscribe(this.respTopic_cb, function (msg: any) {
      cb(msg, false);
    });
    this.subscribe(this.respTopic_end, function (msg: any) {
      console.log('=============================');
      cb(msg, true);
    });
  }

  async connect() {
    this.onConnectPromise = new Promise<void>((resolve, reject) => {
      this.client.connect({
        ...this.options,
        onSuccess: () => {
          console.log('Connected to MQTT broker');
          resolve();
        },
        onFailure: (err: any) => {
          console.log('Failed to connect to MQTT broker:', err);
          reject(err);
        },
      });
    });
    await this.onConnectPromise;
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
  }

  // MQTT message publish function
  publish(msg: string) {
    var payload = new Paho.Message(msg);
    payload.destinationName = this.pubTopic;
    this.client.send(payload);
    console.log('Published message: ' + msg);
  }

  // MQTT message subscribe function
  subscribe(topic: string, onMessageReceived: { (msg: any): void; (msg: any): void }) {
    if (!this.subscriptions[topic]) {
      this.subscriptions[topic] = {
        onMessageReceived: onMessageReceived,
      };
      this.client.subscribe(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } else {
      console.warn(`Already subscribed to topic: ${topic}`);
    }
  }

  // MQTT message received handler
  onMessageArrived(message: { destinationName: any; payloadString: any }) {
    const topic = message.destinationName;
    const payload = message.payloadString;
    if (this.subscriptions[topic] && this.subscriptions[topic].onMessageReceived) {
      this.subscriptions[topic].onMessageReceived(payload);
    }
  }
}

export function useMqtt(userId: string) {
  return new MQTTApp(userId);
}
