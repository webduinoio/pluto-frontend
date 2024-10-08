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

    /* 修改后的按钮悬停样式，排除禁用状态 */
    button:not([disabled]):hover {
      transform: translateY(-3px);
      color: #fff;
    }

    button[disabled] {
      cursor: not-allowed;
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
      transition: color 0.3s ease; /* 添加颜色过渡效果 */
    }

    #msg.loading {
      color: #777; /* 加载时的灰色 */
    }

    .user-info-panel {
      position: fixed;
      top: 50px;
      right: -300px;
      width: 300px;
      height: 240px;
      font-size: 16px;
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

    /* 新增的彈出窗口樣式 */
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
    }
    .popup {
      width: 480px;
      height: 80px;
      background: #fff;
      padding: 20px;
      color: #000;
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .popup input {
      flex: 1;
      margin-left: 10px;
      padding: 5px;
      font-size: 16px;
    }
    .popup button {
      padding: 5px 10px;
      font-size: 16px;
      cursor: pointer;
    }

    /* 新增的啟動註冊碼按鈕樣式 */
    .activate-button {
      display: inline-block;
      outline: 0;
      cursor: pointer;
      border: 2px solid #000;
      border-radius: 3px;
      color: #fff;
      background: #000;
      font-size: 16px;
      font-weight: 600;
      line-height: 16px;
      padding: 2px;
      text-align: center;
      transition-duration: 0.15s;
      transition-property: all;
      margin-left: 0px;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* 修改后的啟動註冊碼按鈕悬停样式，排除禁用状态 */
    .activate-button:not([disabled]):hover {
      color: #000;
      background: rgb(255, 218, 87);
    }
  `;

  static properties = {
    isOpen: { type: Boolean },
    userInfo: { type: Object },
    isPopupOpen: { type: Boolean },
    registrationCode: { type: String },
    isLoading: { type: Boolean }, // 新增加载状态属性
  };

  constructor() {
    super();
    this.userInfo = {
      name: "---",
      email: "---",
      role: "---",
    };
    this.isPopupOpen = false;
    this.registrationCode = "";
    this.isLoading = true; // 初始化为加载状态
  }

  firstUpdated() {
    var self = this;
    if (typeof window.Main != "undefined") {
      window.Main.registry("waUser", this);
    }
    const intervalId = setInterval(() => {
      if (window.user) {
        clearInterval(intervalId);
        self.userInfo = {
          id: window.user.id,
          name: window.user.name,
          email: window.user.email,
          role: window.user.role,
        };
        fetch("https://chat.nodered.vip/api/activationQry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.userInfo),
        })
          .then((response) => {
            // 檢查回應是否成功
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log("server data:", data);
            self.isLoading = false;
            self.requestUpdate();
            self.userInfo = data;
          })
          .catch((error) => {
            console.log("error:", error);
          });
      }
    }, 250);
  }

  updated(changedProperties) {
    if (changedProperties.has("isPopupOpen") && this.isPopupOpen) {
      // 聚焦輸入框
      const input = this.renderRoot.querySelector(".popup input");
      if (input) {
        input.focus();
      }
    }
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
  }

  openRegistrationPopup() {
    this.togglePanel();
    this.isPopupOpen = true;
  }

  closeRegistrationPopup() {
    this.isPopupOpen = false;
    this.registrationCode = "";
  }

  handleInputChange(e) {
    this.registrationCode = e.target.value;
    this.requestUpdate();
  }

  handleKeyPress(e) {
    if (e.key === "Enter" && this.isRegistrationCodeValid()) {
      this.activateRegistration();
    }
  }

  isRegistrationCodeValid() {
    return this.registrationCode.length === 6;
  }

  activateRegistration() {
    var self = this;
    console.log(`註冊碼: ${this.registrationCode}`);
    var requestData = JSON.parse(JSON.stringify(this.userInfo));
    requestData.activationCode = this.registrationCode;
    // 使用 fetch API 發送 POST 請求
    fetch("https://chat.nodered.vip/api/activation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        // 檢查回應是否成功
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("activateRegistration resp:", data);
        self.userInfo["role"]["name"] = data.role.name;
        self.userInfo["endDate"] = data.endDate;
        if (data.state == 'success') {
          alert('啟用成功 , 使用期限: ' + data.endDate);
        } else {
          alert('啟用失敗: ' + data.descript);
        }
        self.requestUpdate();
      })
      .catch((error) => {
        console.log("error:", error);
      });
    // 在这里添加激活逻辑
    this.closeRegistrationPopup();
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
        <span id="msg" class="${this.isLoading ? "loading" : ""}">帳號</span>
      </button>

      <div class="user-info-panel ${this.isOpen ? "open" : ""}">
        <div class="close-button" @click="${this.togglePanel}">X</div>
        <h2><span>${this.userInfo.role.name}</span></h2>
        <p>姓名：${this.userInfo.name}</p>
        <p>EMail: ${this.userInfo.email}</p>

        ${this.userInfo.role.name === "user"
          ? html`
              <button
                class="activate-button"
                @click="${this.openRegistrationPopup}"
              >
                啟動註冊碼
              </button>
            `
          : html`<p>使用有效期: ${this.userInfo.endDate}</p>`}
      </div>

      ${this.isPopupOpen
        ? html`
            <div class="popup-overlay">
              <div class="popup">
                <label>
                  請輸入啟動註冊碼:
                  <input
                    type="text"
                    .value="${this.registrationCode}"
                    @input="${this.handleInputChange}"
                    @keypress="${this.handleKeyPress}"
                    maxlength="6"
                  />
                </label>
                <button
                  class="activate-button"
                  @click="${this.activateRegistration}"
                  ?disabled="${!this.isRegistrationCodeValid()}"
                >
                  啟動
                </button>
              </div>
            </div>
          `
        : ""}
    `;
  }
}

customElements.define("wa-user", WAUser);
