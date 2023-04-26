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
        bottom: 20px;
        background-color: transparent;
        border: none;
        outline: none; 
        cursor: pointer;     
      }
      ::placeholder {
        color: #ccc;
      }
    `
  }

  static get properties() {
    return {

    };
  }

  constructor() {
    super();
    this.loading = false;
    this.loadingTextIndex = 0;
    this.loadingTexts = ['.', '..', '...'];
  }

  setMQTT(app) {
    this.mqtt = app;
  }

  render() {
    return html`
      <div id="chatbox"></div>
      <div id="input-area">
        <textarea id='txtarea' placeholder="你想要讓 AI 做什麼 ?" rows="1" 
        @keydown="${this.handleTextareaKeyDown}" 
        @keypress="${this.handleTextareaKeyPress}"></textarea>
        <button id="send-button" @click="${this.sendMessage}">
          <img src='../coms/gpt_send.svg' width='24px'>
        </button>
      </div>
    `;
  }

  // https://jsbin.com/tihivunope/1/edit?html,output
  firstUpdated() {
    //*/
    if (typeof (parent.Main) != "undefined") {
      parent.Main.registry("gpt", this);
    }
    this.textarea = this.shadowRoot.querySelector('#txtarea');
    this.textareaStyle = window.getComputedStyle(this.textarea);
    ChatGPTBot.lineHeight = parseFloat(this.textareaStyle.lineHeight);
    window.init();
  }

  handleTextareaKeyDown(e) {
    if (e.keyCode === 13 && e.shiftKey) { // Shift + Enter key
      ChatGPTBot.shift_enter_Key = true;
    }
  }

  handleTextareaKeyPress(e) {
    const textarea = e.target;
    const lineHeight = ChatGPTBot.lineHeight;
    if (textarea.value.trim() == '') {
      textarea.value = '';
      return;
    }
    if (e.keyCode === 13 && !ChatGPTBot.shift_enter_Key) { // Enter key
      this.sendMessage();
      setTimeout(function () {
        textarea.value = '';
      }, 10);
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

  userSay(message) {
    const chatbox = this.shadowRoot.querySelector('#chatbox');
    const div = document.createElement('div');
    div.style.backgroundColor = '#eee';
    div.style.paddingTop = '10px';
    div.style.paddingBottom = '10px';
    const icon = document.createElement('img');
    icon.style.float = 'left';
    icon.src = '../coms/user.png';
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

  clear() {
    const chatbox = this.shadowRoot.querySelector('#chatbox');
    chatbox.innerHTML = '';
  }

  start(iconName) {
    const chatbox = this.shadowRoot.querySelector('#chatbox');
    const div = document.createElement('div');
    div.style.backgroundColor = '#ddd';
    div.style.paddingTop = '10px';
    div.style.paddingBottom = '10px';

    // Add icon image
    const icon = document.createElement('img');
    this.icon = icon;
    icon.width = 30;
    icon.height = 30;
    icon.style.float = 'left';
    div.appendChild(icon);

    // Add like and dislike buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.float = 'right';
    buttonContainer.style['margin-right'] = '5px';
    div.appendChild(buttonContainer);

    const likeButton = document.createElement('button');
    likeButton.innerText = '👍';
    likeButton.memo = 'like';
    likeButton.style.marginLeft = '10px';
    likeButton.style.filter = 'grayscale(100%)';
    this.addBtnListener(likeButton);
    buttonContainer.appendChild(likeButton);

    const dislikeButton = document.createElement('button');
    dislikeButton.innerText = '👎';
    dislikeButton.memo = 'dislike';
    dislikeButton.style.marginLeft = '5px';
    dislikeButton.style.filter = 'grayscale(100%)';
    this.addBtnListener(dislikeButton);
    buttonContainer.appendChild(dislikeButton);

    // Add message text
    const text = document.createElement('div');
    text.style.paddingLeft = '50px';
    text.style.paddingTop = '10px';
    text.innerHTML = '';
    this.message = text;
    this.setIconName(iconName);
    div.appendChild(text);

    chatbox.appendChild(div);
    this.sending();
  }

  addBtnListener(btn, cb) {
    btn.btnClicked = false;
    var self = this;
    btn.info = [];
    btn.addEventListener('click', () => {
      btn.btnClicked = !btn.btnClicked;
      if (btn.btnClicked) {
        btn.style.filter = 'none';
        btn.info = [self.uuid, btn.memo, true];
      } else {
        btn.style.filter = 'grayscale(100%)';
        btn.info = [self.uuid, btn.memo, false];
      }
      this.mqtt.publish('feedback:' + JSON.stringify(btn.info));
    });
  }

  setUUID(uuid) {
    this.uuid = uuid;
  }

  setIconName(name) {
    this.icon.src = '../coms/' + name + '.png';
  }

  sending() {
    this.loading = true;
    const sendButton = this.shadowRoot.querySelector('#send-button');
    sendButton.disabled = true;
    this.loadingInterval = setInterval(() => {
      sendButton.innerHTML = `${this.loadingTexts[this.loadingTextIndex]}`;
      this.loadingTextIndex = (this.loadingTextIndex + 1) % this.loadingTexts.length;
    }, 250);
  }

  read() {
    return this.message.innerHTML;
  }

  write(msg) {
    this.message.innerHTML = msg;
    const chatbox = this.shadowRoot.querySelector('#chatbox');
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  /*
  * 完成 completion 顯示
  */
  done() {
    this.loading = false;
    clearInterval(this.loadingInterval);
    const sendButton = this.shadowRoot.querySelector('#send-button');
    sendButton.disabled = false;
    sendButton.innerHTML = `<img src='../coms/gpt_send.svg' width='24px'>`;
  }

  sendMessage() {
    const textarea = this.textarea;
    this.userSay(textarea.value);
    this.promptCallback(textarea.value);
    textarea.value = '';
    textarea.rows = 1;
    textarea.style.height = '44px';
    textarea.style.marginTop = '';
    textarea.focus();
  }

  prompt(msg) {
    this.textarea.value = msg;
    var e = {};
    e.target = this.textarea;
    this.handleTextareaKeyPress(e);
  }

  promptCallback(callback) {
    this.promptCallback = callback;
  }
}

customElements.define('wa-gpt-bot', ChatGPTBot);