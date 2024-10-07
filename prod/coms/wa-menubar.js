import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js";

/**
 * filename：wa-menubar.js
 * descript：工具選單 (包含Logo、按鈕)
 * Author: Marty
 * Date: 2022/02
 */
export class MenuBar extends LitElement {
  static styles = [
    css`
      #menubar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        background-color: var(--menubar-bg, #058);
        height: 40px;
      }

      .menu-left {
        display: flex;
        align-items: center;
      }

      .menu-right {
        display: flex;
        align-items: center;
      }

      .btn {
        transition: all 0.5s ease;
        cursor: pointer;
        color: #eee;
        margin: 0 5px;
        font-size: 16px;
        display: flex;
        align-items: center;
      }

      .btn:hover {
        transform: translateY(-3px);
        color: #fff;
      }

      svg {
        fill: #eee;
        width: 24px;
        height: 24px;
        margin-right: 5px;
      }

      .material-icons {
        font-size: 24px;
        margin-right: 5px;
      }
    `,
  ];

  firstUpdated() {
    const themesStyle = {
      default: {
        titleBar: {
          top: "5px",
          height: "40px",
          color: "#fff",
          "text-decoration": "none",
          background: "#058",
          "z-index": "100",
        },
      },
      egame: {
        titleBar: {
          top: "5px",
          height: "40px",
          color: "#fff",
          "text-decoration": "none",
          background: "#ffd83b",
          "z-index": "100",
        },
      },
    };

    let menubar = this.renderRoot.querySelector("#menubar");

    // 設置主題
    let theme = this.getAttribute("theme") || "default";
    let themeStyle = themesStyle[theme]?.titleBar;

    if (themeStyle) {
      for (let key in themeStyle) {
        menubar.style[key] = themeStyle[key];
      }
    }

    // 如果不需要模式切換，則不用調用 changeMode()
  }

  render() {
    return html`
      <div id="menubar">
        <div class="menu-left">
          <!-- 您可以在這裡添加其他左側的菜單項 -->
        </div>
        <div class="menu-right">
          <slot></slot> <!-- 渲染子元素 (如 wa-user) -->
        </div>
      </div>
    `;
  }
}
customElements.define("wa-menubar", MenuBar);