import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";

export class WAUser extends LitElement {
  static styles = css`
    /* 现有样式 */
    button {
      display: flex;
      transition: all 0.5s ease;
      background-color: transparent;
      cursor: pointer;
      color: #eee;
      border: none;
      font-size: 16px;
      width: 96px;
      margin-left: -15px;
      margin-top: -2px;
    }

    button:hover {
      transform: translateY(-3px);
      color: #fff;
    }
    button[disabled] {
      cursor: pointer;
      color: #777;
    }
    svg {
      fill: #eee;
      width: 24px;
      height: 24px;
      display: inline-block;
    }
    #msg {
      width: 40px;
      margin-left: -5px;
      display: inline-block;
    }
    .user-info-panel {
      position: fixed;
      top: 50px;
      right: -300px;
      width: 300px;
      height: 30%;
      background-color: #eee;
      color: black;
      box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
      transition: right 0.3s ease-in-out;
      z-index: 1000;
      padding: 20px;
      box-sizing: border-box;
    }

    .user-info-panel.open {
      right: 0;
    }

    .close-button {
      position: absolute;
      top: 10px;
      right: 10px;
      cursor: pointer;
    }
  `;

  static properties = {
    isOpen: { type: Boolean },
    userInfo: { type: Object },
  };

  constructor() {
    super();
    this.isOpen = false;
    this.userInfo = {
      name: "管理者",
      email: "admin@webduino.io",
      role: "PRO",
      daysLeft: -37,
    };
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
  }

  render() {
    return html`
      <button @click="${this.togglePanel}">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="40"
          viewBox="0 -960 960 960"
          width="40"
          style="padding-right: 2px;"
        >
          <path
            d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"
          />
        </svg>
        <span id="msg"> 帳號</span>
      </button>

      <div class="user-info-panel ${this.isOpen ? "open" : ""}">
        <div class="close-button" @click="${this.togglePanel}">X</div>
        <h2>${this.userInfo.name} <span>${this.userInfo.role}</span></h2>
        <p>${this.userInfo.email}</p>
        <p>剩余天数：${this.userInfo.daysLeft}</p>
        <p>方案介绍</p>
        <p>学习资源</p>
        <p>登出</p>
      </div>
    `;
  }
}

customElements.define("wa-user", WAUser);
