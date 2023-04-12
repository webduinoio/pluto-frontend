import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'

class ChatGPTBot extends LitElement {

  static get styles() {
    return css`
      #chatbox {
        height: calc(100% - 44px);
        width: 100%;
        overflow-y: scroll;
        white-space: pre-line;
      }
      #input-area {
        width: 100%;
        position: relative;
        bottom: 0px;
      }
      #input-area Textarea {
        width: 100%;
        height: 44px; 
        line-height: 24px;
        font-size: 16px;
        padding: 10px;
        padding-right: 50px;
        box-sizing: border-box;
        resize: none;
        border: 1px solid #ccc;
        overflow: auto;
        max-height: 140px; /* 5行的高度 */
      }
      #input-area button {
        position: absolute;
        height: 20px;
        right: 10px;
        bottom: 17px;
      }
    `
  }

  static get properties() {
    return {

    };
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div id="chatbox"></div>
      <div id="input-area">
        <textarea id='txtarea' rows="1" @keydown="${this.handleTextareaKeyDown}" @keyup="${this.handleTextareaKeyUp}"></textarea>
        <button @click="${this.sendMessage}">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
            <path d="M3 13h18v-2H3v2zm0 5h18v-2H3v2zm0-10v2h18v-2H3z"/>
          </svg>
        </button>
      </div>
    `;
  }

  // https://jsbin.com/tihivunope/1/edit?html,output
  firstUpdated() {
    this.textarea = this.shadowRoot.querySelector('#txtarea');
    this.textareaStyle = window.getComputedStyle(this.textarea);
    ChatGPTBot.lineHeight = parseFloat(this.textareaStyle.lineHeight);
    window.qq = this.textarea;
  }

  handleTextareaKeyUp(e) {
    const textarea = e.target;
    const lineHeight = ChatGPTBot.lineHeight;
    if (textarea.value.trim() == '') {
      textarea.value = '';
      return;
    }
    if (e.keyCode === 13 && !ChatGPTBot.shift_enter_Key) { // Enter key
      this.sendMessage();
      return;
    }
    ChatGPTBot.shift_enter_Key = false;
    var nowRow = textarea.value.split('\n').length;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    const rows = Math.floor(textarea.scrollHeight / lineHeight);
    const diffRows = rows - parseInt(textarea.getAttribute('rows'));
    if (nowRow < 5) {
      if (diffRows > 0) {
        textarea.style.marginTop = `-${diffRows * lineHeight}px`;
      } else {
        textarea.style.marginTop = '';
      }
    } else {
      textarea.style.marginTop = `-${4 * lineHeight}px`;
    }
    if (rows > 6) {
      textarea.style.overflowY = 'scroll';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }

  handleTextareaKeyDown(e) {
    if (e.keyCode === 13 && e.shiftKey) { // Shift + Enter key
      ChatGPTBot.shift_enter_Key = true;
    }
  }

  userSay(message) {
    const chatbox = this.shadowRoot.querySelector('#chatbox');
    const div = document.createElement('div');
    div.style.backgroundColor = '#ddd1';
    div.style.paddingTop = '10px';
    div.style.paddingBottom = '10px';
    const icon = document.createElement('img');
    icon.style.float = 'left';
    icon.src = 'https://cdn-icons-png.flaticon.com/512/145/145867.png';
    icon.width = 30;
    icon.height = 30;
    div.appendChild(icon);
    const text = document.createElement('div');
    text.style.paddingLeft = '50px';
    text.style.paddingTop = '10px';
    text.innerHTML = message;
    div.appendChild(text);
    chatbox.appendChild(div);
    // 捲動至底部
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  start() {
    const chatbox = this.shadowRoot.querySelector('#chatbox');
    const div = document.createElement('div');
    div.style.backgroundColor = '#eee';
    div.style.paddingTop = '10px';
    div.style.paddingBottom = '10px';
    const icon = document.createElement('img');
    icon.style.float = 'left';
    icon.src = 'https://test.bpi-steam.com/static/image/WebBit_V2_500x.png';
    icon.width = 30;
    icon.height = 30;
    div.appendChild(icon);
    const text = document.createElement('div');
    text.style.paddingLeft = '50px';
    text.style.paddingTop = '10px';
    text.innerHTML = '';
    this.message = text;
    div.appendChild(text);
    chatbox.appendChild(div);
  }

  write(msg) {
    this.message.innerHTML = msg;
    const chatbox = this.shadowRoot.querySelector('#chatbox');
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  sendMessage() {
    const textarea = this.textarea;
    this.userSay(textarea.value);
    textarea.value = '';
    textarea.rows = 1;
    textarea.style.height = '44px';
    textarea.style.marginTop = '';
    textarea.focus();
    //this.botSay("好的.");
  }
}

customElements.define('wa-gpt-bot', ChatGPTBot);