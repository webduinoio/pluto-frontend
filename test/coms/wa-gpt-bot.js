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
        bottom: 15px;
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

  done() {
    this.loading = false;
    clearInterval(this.loadingInterval);
    const sendButton = this.shadowRoot.querySelector('#send-button');
    sendButton.disabled = false;
    sendButton.innerHTML = `
      <svg width="24px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.33 3.66996C20.1408 3.48213 19.9035 3.35008 19.6442 3.28833C19.3849 3.22659 19.1135 3.23753 18.86 3.31996L4.23 8.19996C3.95867 8.28593 3.71891 8.45039 3.54099 8.67255C3.36307 8.89471 3.25498 9.16462 3.23037 9.44818C3.20576 9.73174 3.26573 10.0162 3.40271 10.2657C3.5397 10.5152 3.74754 10.7185 4 10.85L10.07 13.85L13.07 19.94C13.1906 20.1783 13.3751 20.3785 13.6029 20.518C13.8307 20.6575 14.0929 20.7309 14.36 20.73H14.46C14.7461 20.7089 15.0192 20.6023 15.2439 20.4239C15.4686 20.2456 15.6345 20.0038 15.72 19.73L20.67 5.13996C20.7584 4.88789 20.7734 4.6159 20.7132 4.35565C20.653 4.09541 20.5201 3.85762 20.33 3.66996ZM4.85 9.57996L17.62 5.31996L10.53 12.41L4.85 9.57996ZM14.43 19.15L11.59 13.47L18.68 6.37996L14.43 19.15Z" fill="#000000"></path> </g></svg>
      `;
  }

  render() {
    return html`
      <div id="chatbox"></div>
      <div id="input-area">
        <textarea id='txtarea' placeholder="你想要讓 AI 做什麼 ?" rows="1" @keydown="${this.handleTextareaKeyDown}" @keyup="${this.handleTextareaKeyUp}"></textarea>
        <button id="send-button" @click="${this.sendMessage}" style="height:24px;width:42px">
          <svg width="24px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.33 3.66996C20.1408 3.48213 19.9035 3.35008 19.6442 3.28833C19.3849 3.22659 19.1135 3.23753 18.86 3.31996L4.23 8.19996C3.95867 8.28593 3.71891 8.45039 3.54099 8.67255C3.36307 8.89471 3.25498 9.16462 3.23037 9.44818C3.20576 9.73174 3.26573 10.0162 3.40271 10.2657C3.5397 10.5152 3.74754 10.7185 4 10.85L10.07 13.85L13.07 19.94C13.1906 20.1783 13.3751 20.3785 13.6029 20.518C13.8307 20.6575 14.0929 20.7309 14.36 20.73H14.46C14.7461 20.7089 15.0192 20.6023 15.2439 20.4239C15.4686 20.2456 15.6345 20.0038 15.72 19.73L20.67 5.13996C20.7584 4.88789 20.7734 4.6159 20.7132 4.35565C20.653 4.09541 20.5201 3.85762 20.33 3.66996ZM4.85 9.57996L17.62 5.31996L10.53 12.41L4.85 9.57996ZM14.43 19.15L11.59 13.47L18.68 6.37996L14.43 19.15Z" fill="#000000"></path> </g></svg>
        </button>
      </div>
    `;
  }

  // https://jsbin.com/tihivunope/1/edit?html,output
  firstUpdated() {
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

  start(iconName) {
    const chatbox = this.shadowRoot.querySelector('#chatbox');
    const div = document.createElement('div');
    div.style.backgroundColor = '#ddd';
    div.style.paddingTop = '10px';
    div.style.paddingBottom = '10px';
    const icon = document.createElement('img');
    icon.style.float = 'left';
    icon.width = 30;
    icon.height = 30;
    this.icon = icon;
    div.appendChild(icon);
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

  sendMessage() {
    const textarea = this.textarea;
    this.userSay(textarea.value);
    this.promptCallback(textarea.value);
    textarea.value = '';
    textarea.rows = 1;
    textarea.style.height = '44px';
    textarea.style.marginTop = '';
    textarea.focus();
    //this.botSay("好的.");
  }

  prompt(msg) {
    this.textarea.value = msg;
    var e = {};
    e.target = this.textarea;
    this.handleTextareaKeyUp(e);
  }

  promptCallback(callback) {
    this.promptCallback = callback;
  }
}

customElements.define('wa-gpt-bot', ChatGPTBot);