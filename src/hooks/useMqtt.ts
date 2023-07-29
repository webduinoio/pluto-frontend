import { MQTT_TOPIC } from '@/enums';

class MQTTApp {
  userId: string;
  client: any;
  options: any;
  pubTopic: string;
  respTopic_cb: string;
  respTopic_end: string;
  onConnectPromise: Promise<void> | null;
  subscriptions: Record<string, { onMessageReceived: (msg: any) => void }>;
  failure: boolean;

  constructor(userId: string, topic: string) {
    this.userId = userId;
    this.client = new Paho.Client('wss://mqtt.webduino.io/mqtt', userId);
    this.options = {
      reconnect: true,
      timeout: 900,
      keepAliveInterval: 30,
      userName: 'webduino',
      password: 'webduino',
    };
    this.onConnectPromise = null;
    this.subscriptions = {}; // 存儲訂閱關係的對象
    this.pubTopic = topic + '_prompt/' + userId;
    this.respTopic_cb = topic + '_completion/' + this.userId;
    this.respTopic_end = topic + '_completion_end/' + this.userId;
    this.failure = false;
  }

  async init(cb: (msg: any, end: boolean) => void) {
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
          for (const topic in this.subscriptions) {
            this.client.subscribe(topic);
            console.log(`Re-subscribed to topic: ${topic}`);
          }
          resolve();
        },
        onFailure: (err: any) => {
          console.log('Failed to connect to MQTT broker:', err);
          this.reconnect(err);
          reject(err);
        },
      });
    });
    await this.onConnectPromise;
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
  }

  // reconnect method
  async reconnect(err: any) {
    console.log('Trying to reconnect...');
    setTimeout(async () => {
      // Check if client is still connected
      if (this.client.isConnected()) {
        // If client is still connected, disconnect first before reconnecting
        this.client.disconnect();
        console.log('Disconnected before trying to reconnect');
      }
      try {
        await this.connect();
      } catch (error) {
        console.error(error);
      }
    }, 5000); // wait for 5 seconds before trying to reconnect
  }


  // disconnect method
  disconnect() {
    this.client.disconnect();
    console.log('Disconnected from MQTT broker');
    // perform other cleanup operations if needed
  }

  // handle lost connection
  onConnectionLost(responseObject: any) {
    if (responseObject.errorCode !== 0) {
      console.log('onConnectionLost:' + responseObject.errorMessage);
      this.reconnect(responseObject);
    }
  }

  // MQTT message publish function
  publish(msg: string) {
    const payload = new Paho.Message(msg);
    payload.destinationName = this.pubTopic;
    this.client.send(payload);
    console.log('Published message: ' + msg);
  }

  // MQTT message subscribe function
  subscribe(topic: string, onMessageReceived: (msg: any) => void) {
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
  onMessageArrived(message: any) {
    const topic = message.destinationName;
    const payload = message.payloadString;
    if (this.subscriptions[topic] && typeof this.subscriptions[topic].onMessageReceived === 'function') {
      this.subscriptions[topic].onMessageReceived(payload);
    }
  }
}

export function useMqtt(userId: string, topic: string = MQTT_TOPIC.KN) {
  const app = new MQTTApp(userId, topic);
  // add cleanup operations when the window is closed or the tab is refreshed
  window.addEventListener('beforeunload', () => app.disconnect());
  return app;
}
