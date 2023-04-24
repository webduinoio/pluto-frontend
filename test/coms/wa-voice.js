import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'

class SpeechRecognition extends LitElement {
  static get properties() {
    return {
      recognition: { type: Object },
      isRecording: { type: Boolean },
      callback: { type: String },
      result: { type: String },
    };
  }

  static get styles() {
    return css`
      #toggle-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1em;
        font-weight: bold;
        padding: 5px;
        border: none;
        border-radius: 5px;
        background-color: #2ecc71;
        color: #fff;
        cursor: pointer;
      }

      #toggle-btn.disabled {
        background-color: #fcc;
        cursor: default;
      }

      #toggle-btn svg {
        margin-right: 5px;
        fill: currentColor;
      }
    `;
  }

  constructor() {
    super();
    this.recognition = null;
    this.isRecording = false;
    this.result = '';
  }

  async firstUpdated() {
    try {
      this.voiceBtn = this.shadowRoot.getElementById('toggle-btn');
      this.callback = window[this.callback];
      await navigator.mediaDevices.getUserMedia({ audio: true });
      this.isRecording = true;
    } catch (error) {
      this.setEnable(false);
      console.error('無法取得麥克風權限：', error);
    }
  }

  render() {
    return html`
      <button
        id="toggle-btn"
        class=${this.isRecording && !this.recognition ? '' : 'disabled'}
        @click=${this.handleToggleBtnClick}
      >
      <svg fill="#000000" width="24px" height="24px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M960.315 96.818c-186.858 0-338.862 152.003-338.862 338.861v484.088c0 186.858 152.004 338.862 338.862 338.862 186.858 0 338.861-152.004 338.861-338.862V435.68c0-186.858-152.003-338.861-338.861-338.861M427.818 709.983V943.41c0 293.551 238.946 532.497 532.497 532.497 293.55 0 532.496-238.946 532.496-532.497V709.983h96.818V943.41c0 330.707-256.438 602.668-580.9 627.471l-.006 252.301h242.044V1920H669.862v-96.818h242.043l-.004-252.3C587.438 1546.077 331 1274.116 331 943.41V709.983h96.818ZM960.315 0c240.204 0 435.679 195.475 435.679 435.68v484.087c0 240.205-195.475 435.68-435.68 435.68-240.204 0-435.679-195.475-435.679-435.68V435.68C524.635 195.475 720.11 0 960.315 0Z" fill-rule="evenodd"></path> </g></svg>
        開始錄音
      </button>
    `;
  }

  setEnable(enabled) {
    this.voiceBtn.disabled = !enabled;
    if (enabled) {
      this.voiceBtn.classList.remove('disabled');
    } else {
      this.voiceBtn.classList.add('disabled');
    }
  }

  updateResult(txt) {
    this.result = txt;
  }

  handleToggleBtnClick() {
    if (!this.recognition) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.lang = 'zh-TW';

      this.recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1][0].transcript;
        this.result += result;
        this.callback(this.result);
      };

      this.recognition.onend = () => {
        this.isRecording = true;
        this.recognition = null;
        this.result = this.result + "\n";
        this.callback(this.result);
      };

      this.recognition.start();
      this.isRecording = false;
      this.callback(this.result);
    } else {
      this.recognition.stop();
    }
  }
}

customElements.define('wa-voice', SpeechRecognition);
