import { LitElement, html, css } from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";

class WAUser extends LitElement {
  static styles = css`
    .user-btn {
      cursor: pointer;
      color: #eee;
      display: flex;
      align-items: center;
      padding: 5px;
    }
    .user-btn:hover {
      color: #fff;
    }
    .material-icons {
      font-size: 24px;
      margin-right: 5px;
    }
  `;

  render() {
    return html`
      <div class="user-btn" @click="${this.showUserInfo}">
        <span class="material-icons">account_circle</span>
        <span>用户</span>
      </div>
    `;
  }

  showUserInfo() {
    const user = window.user;
    if (user) {
      alert(`用户信息:\nID: ${user.id}\n名称: ${user.name}\n邮箱: ${user.email}`);
    } else {
      alert('未找到用户信息');
    }
  }
}

customElements.define('wa-user', WAUser);