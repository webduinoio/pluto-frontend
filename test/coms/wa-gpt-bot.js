import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'
// https://jsbin.com/tejazuyonu/2/edit?html,output

class ChatGPTBot extends LitElement {

    static get styles() {
        return css`
      #chatbox {
        border: 1px solid black;
        height: 300px;
        overflow-y: scroll;
        padding: 10px;
        white-space: pre-line;
      }
      #input-area {
        display: flex;
        margin-top: 10px;
      }
      #input-area textarea {
        flex-grow: 1;
        resize: none;
      }
      #input-area button {
        margin-left: 10px;
      }
    `;
    }

    static get properties() {
        return {
            lineCount: { type: Number }
        };
    }

    constructor() {
        super();
        this.lineCount = 1;
    }

    render() {
        return html`
      <div id="chatbox"></div>
      <div id="input-area">
        <textarea rows="1" @keydown="${this.handleTextareaKeyDown}"></textarea>
        <button @click="${this.sendMessage}">Send</button>
      </div>
    `;
    }

    handleTextareaKeyDown(e) {
        const textarea = e.target;
        if (e.keyCode === 13 && !e.shiftKey) { // Enter key
            e.preventDefault();
            this.sendMessage();
        } else if (e.keyCode === 13 && e.shiftKey && this.lineCount < 5) { // Shift + Enter key
            e.preventDefault();
            textarea.value += '\n';
            textarea.rows = ++this.lineCount;
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

    botSay(message) {
        const chatbox = this.shadowRoot.querySelector('#chatbox');
        const div = document.createElement('div');
        div.style.backgroundColor = '#eee';
        div.style.paddingTop = '10px';
        div.style.paddingBottom = '10px';
        const icon = document.createElement('img');
        icon.style.float = 'left';
        icon.src = 'https://avatars.slack-edge.com/2021-03-25/1882974265975_c2814223e012464d1ead_512.png';
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

    sendMessage() {
        const textarea = this.shadowRoot.querySelector('textarea');
        const message = textarea.value;
        if (message.trim() !== '') {
            this.userSay(message);
            textarea.value = '';
            textarea.rows = 1;
            this.lineCount = 1;
            textarea.focus();
            this.botSay("好的.");
        }
    }

}

customElements.define('wa-gpt-bot', ChatGPTBot);