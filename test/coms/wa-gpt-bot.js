import { LitElement, html, css } from 'lit';

class ChatApp extends LitElement {
  static get styles() {
    return css`
      #chat-area {
        width: 100%;
        height: 300px;
        border: 1px solid black;
        overflow-y: scroll;
      }

      #input-area {
        display: flex;
      }

      #message-input {
        flex-grow: 1;
        resize: none;
      }
    `;
  }

  static get properties() {
    return {
      messageCount: { type: Number },
    };
  }

  constructor() {
    super();
    this.messageCount = 0;
  }

  render() {
    return html`
      <div id="chat-area"></div>
      <div id="input-area">
        <textarea
          id="message-input"
          rows="1"
          @keydown="${this._handleInputKeyDown}"
        ></textarea>
        <button id="send-button" @click="${this._handleSendButtonClick}">
          Send
        </button>
      </div>
    `;
  }

  _addMessage(message) {
    const chatArea = this.shadowRoot.querySelector('#chat-area');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = message;
    chatArea.appendChild(messageElement);
    chatArea.scrollTop = chatArea.scrollHeight;

    const messageInput = this.shadowRoot.querySelector('#message-input');
    messageInput.rows = 1;
  }

  _sendMessage() {
    const messageInput = this.shadowRoot.querySelector('#message-input');
    const message = messageInput.value.trim();
    if (message !== '') {
      this._addMessage(message.replace(/\n/g, '<br>'));
      messageInput.value = '';
    }
  }

  _handleInputKeyDown(event) {
    const messageInput = this.shadowRoot.querySelector('#message-input');
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this._sendMessage();
    } else if (event.key === 'Enter' && event.shiftKey) {
      if (messageInput.rows < 5) {
        messageInput.rows++;
      }
    }
  }

  _handleSendButtonClick() {
    this._sendMessage();
  }
}

customElements.define('chat-app', ChatApp);
