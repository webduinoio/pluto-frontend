class MQTTApp {
    constructor(userId) {
        //*/
        if (typeof (parent.Main) != "undefined") {
            parent.Main.registry("mqtt", this);
        }
        this.userId = userId;
        this.client = new Paho.Client('wss://mqtt1.webduino.io/mqtt', userId);
        this.options = {
            userName: 'webduino', password: 'webduino', keepAliveInterval: 3
        };
        this.onConnectPromise = null;
        this.subscriptions = {}; // 存儲訂閱關係的對象
        var topic = "gpt35";
        //使用測試機
        if (parent.location.href.indexOf('/test/dev') > 0) {
            topic = "dev";
        }
        this.pubTopic = topic + '_prompt/' + userId;
        this.respTopic_cb = topic + "_completion/" + this.userId;
        this.respTopic_end = topic + "_completion_end/" + this.userId;
        this.failure = false;
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
        var self = this;
        // add keepAlive property
        this.keepAlive = setInterval(() => {
            if (!this.client.isConnected()) {
                console.log('Disconnected from MQTT broker, attempting to reconnect...');
                if (typeof (parent.Main) != "undefined") {
                    self.failure = true;
                    parent.Main.eventTrigger("mqtt", "onFailure", "");
                }
                clearInterval(self.keepAlive);
            }
        }, 10000);
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