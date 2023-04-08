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
        width: 0.5em;
        height: 0.5em;
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
      this.callback = window[this.callback];
      await navigator.mediaDevices.getUserMedia({ audio: true });
      this.isRecording = true;
    } catch (error) {
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M12 2c4.41 0 8 3.59 8 8v4c0 4.41-3.59 8-8 8s-8-3.59-8-8V10c0-4.41 3.59-8 8-8zm2 12h-4v-2h4v2z"
          />
        </svg>
        開始錄音
      </button>
    `;
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
