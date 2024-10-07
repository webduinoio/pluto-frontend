import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";

export class WAUser extends LitElement {
  static styles = [
    css`
      button {
        display: flex;
        transition: all 0.5s ease;
        background-color: transparent;
        cursor: pointer;
        color: #eee;
        border: none;
        font-size: 16px;
        width: 40px;
        margin-left: -15px;
        margin-top: 0px;
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
    `,
  ];

  async firstUpdated() {
    let self = this;
  }

  render() {
    return html`
      <button @click="${this.showUserInfo}">
        <svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 -960 960 960" width="24">
          <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
        </svg>
      </button>
    `;
  }

  showUserInfo() {
    const user = window.user;
    if (user) {
      alert(
        `用户信息:\nID: ${user.id}\n名称: ${user.name}\n邮箱: ${user.email}`
      );
    } else {
      alert("未找到用户信息");
    }
  }
}

customElements.define("wa-user", WAUser);
