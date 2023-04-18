
class MQTTApp {
    constructor(userId) {
        this.userId = userId;
        this.client = new Paho.Client('wss://mqtt1.webduino.io/mqtt', userId);
        this.options = { userName: 'webduino', password: 'webduino' };
        this.onConnectPromise = null;
        this.subscriptions = {}; // 存儲訂閱關係的對象
        this.pubTopic = 'gpt35_prompt/' + userId;
        this.respTopic_cb = "gpt35_completion/" + this.userId;
        this.respTopic_end = "gpt35_completion_end/" + this.userId;
    }

    async init(cb) {
        await this.connect();
        this.subscribe(this.respTopic_cb, function (msg) {
            cb(msg, false);
        });
        this.subscribe(this.respTopic_end, function (msg) {
            cb(msg, true);
        });
    }

    async connect() {
        this.onConnectPromise = new Promise((resolve, reject) => {
            this.client.connect({
                ...this.options,
                onSuccess: () => {
                    console.log('Connected to MQTT broker');
                    resolve();
                },
                onFailure: (err) => {
                    console.log('Failed to connect to MQTT broker:', err);
                    reject(err);
                }
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

    // MQTT message subscribe function
    subscribe(topic, onMessageReceived) {
        if (!this.subscriptions[topic]) {
            this.subscriptions[topic] = {
                onMessageReceived: onMessageReceived
            };
            this.client.subscribe(topic);
            console.log(`Subscribed to topic: ${topic}`);
        } else {
            console.warn(`Already subscribed to topic: ${topic}`);
        }
    }

    // MQTT message received handler 
    onMessageArrived(message) {
        const topic = message.destinationName;
        //console.log("topic:", topic);
        const payload = message.payloadString;
        //console.log(`Received message: ${payload} on topic: ${topic}`);
        if (this.subscriptions[topic] && this.subscriptions[topic].onMessageReceived) {
            this.subscriptions[topic].onMessageReceived(payload);
        }
    }

}