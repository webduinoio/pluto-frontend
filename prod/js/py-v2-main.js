import MqttV2 from "./py-mqtt-v2.js";

window.mqtt = MqttV2;

async function initPyodide() {
  let pyodide = await loadPyodide(); // 等待 Pyodide 載入

  try {
    // web:bit 範例
    // https://webbit.webduino.io/blockly/#Mq01X7aXGK730

    await pyodide.runPythonAsync(`
from js import mqtt
client = mqtt.Client()

def on_connect(client, userData, flags, rc):
    print("Connected" + "_" + str(userData))
    client.subscribe("sub_zoom2")

def on_message(client, userData, msg):
    print(msg.topic+" "+str(msg.payload) + "_" + str(userData))
    client.publish("test_topic2", "Py2:{"+msg.payload+"}" + str(userData))

client.on_connect = on_connect
client.on_message = on_message

client.username_pw_set("webduino", "webduino")
client.user_data_set("OK")
client.connect("wss://mqtt1.webduino.io/mqtt", "", 60)
client.loop_forever()
client.publish("test_topic2", "Hello")
`);
  } catch (err) {
    console.error("Error calling JavaScript from Python:", err);
  }
}

(async function () {
  initPyodide();
})();
