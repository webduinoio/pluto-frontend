import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";
import MQTTAppV2 from "../js/py-mqtt-v2.js";

/**
 * filename：wa-run-python.js
 * description：按下此按鈕，可以使用 pyodide 套件執行 python 程式
 * associate: editor , wa-output , Main
 * Author: Marty
 * Date: 2022/02
 */
export class RunPython extends LitElement {
  static properties = {
    console: {},
  };

  constructor() {
    super();
  }

  static styles = [
    css`
      svg {
        fill: #990;
        width: 16px;
        height: 16px;
      }
      .btn {
        transition: all 0.5s ease;
        cursor: pointer;
        color: #990;
        float: left;
        font-size: 16px;
        display: flex;
        align-items: center;
        width: 80px;
      }
      .btn:hover {
        transform: translateY(-3px);
        color: #fff;
      }
      .btn svg + span {
        margin-left: 1px;
      }
    `,
  ];

  async runPythonCode(code) {
    try {
      window.mqtt = MQTTAppV2;
      mqtt.disconnectAll();

      let lines = code.split('\n');
      for (let line of lines) {
        line = line.trim();
        if (line) {
          await this.pyodide.runPythonAsync(line);
        }
      }
      return null;
    } catch (err) {
      if (this.pyodide && err.constructor.name === 'PythonError') {
        var errMsg = err.message.split("\n").slice(-3).join(" ");
        var result = errMsg.replace(/(line )(\d+)/, function (match, p1, p2) {
          return p1 + (parseInt(p2) - 2);
        });
        return result;
      } else {
        throw err;
      }
    }
  }

  async firstUpdated() {
    let self = this;
    const run = this.renderRoot.querySelector("#run");
    const icon = this.renderRoot.querySelector("#icon");
    const output = document.getElementById(this.console);
    this.run = run;

    function stdout_func(msg) {
      output.show(msg + "\n");
      output.scrollBottom();
    }

    function stderr_func(msg) {
      output.show(msg + "\n");
      output.scrollBottom();
    }

    function stdin_func() {
      var rtn = prompt("请输入：") || "";
      return rtn;
    }

    run.addEventListener("click", async function () {
      output.cls();
      var newCode = editor.getCode();
      
      await self.pyodide.runPython(`
        import sys
        from js import prompt
        
        def custom_input(*args):
            return prompt("请输入：")
            
        input = custom_input
      `);
      
      await self.runPythonCode(newCode);
    });

    let pyodide;
    console.log("init pyodide....");
    pyodide = await loadPyodide({
      stdin: stdin_func,
      stdout: stdout_func,
      stderr: stderr_func,
    });
    
    run.style["color"] = "#eee";
    icon.style["fill"] = "#eee";

    this.pyodide = pyodide;
    this.output = output;
    run.removeAttribute("disabled");
  }

  hide(state) {
    if (state) {
      this.run.style["display"] = "none";
    } else {
      this.run.style["display"] = "";
    }
  }

  render() {
    return html`
      <div id="run" class="btn">
        <svg id="icon" viewBox="0 0 24 24">
          <path d="M3 22V2L19 12L3 22Z" fill="currentColor" />
        </svg>
        <span>執行</span>
      </div>
    `;
  }
}
customElements.define("wa-run-python", RunPython);
