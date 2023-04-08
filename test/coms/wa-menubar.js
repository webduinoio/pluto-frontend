import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'

/**
 * filename：wa-menubar.js
 * descript：工具選單 (包含Logo、按鈕)
 * Author: Marty
 * Date: 2022/02
 */
export class MenuBar extends LitElement {

    constructor() {
        super();
        this.currentMode = 2;
    }

    static styles = [css`
    #menubar {
        top: 5px;
        height: 40px;
        color: #fff;
        text-decoration: none;
        background: #058;
        z-index: 100;
    }
    .toolMenu {
        width:140px;
        float: right;
        box-sizing: border-box;
        font-size: 15px;
        position: relative;
        background: none;
        cursor: pointer;
        color: #fff;
        margin: 0 5px;
        transition: .3s;
        text-decoration: none;
        z-index: 100;
    }
    svg {
        fill: #eee;
        width: 24px;
        height: 24px;
    }  
    .btn {
        transition: all 0.5s ease;
        cursor: pointer;
        color: #eee;
        float:left;
        font-size: 16px;
        display: flex;
        align-items: center; 
        width:70px;
    }
    .btn:hover {
        transform: translateY(-3px);
        color: #fff;
    }
    .btn svg + span {
        margin-left: 1px;
      }    
  `];

    firstUpdated() {
        var self = this;
        let button = this.renderRoot.querySelector("#button");
        button.addEventListener("click", function () {
            self.changeMode();
        });
        this.changeMode();
    }

    changeMode() {
        let path = this.renderRoot.querySelector("#path");
        let text = this.renderRoot.querySelector("#text");
        switch (++this.currentMode % 3) {
            case 0:
                editor.setMode('text');
                path.setAttribute("d", "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z");
                text.innerHTML = "程式";
                break;
            case 1:
                editor.setMode('block');
                path.setAttribute("d", "M4 4H20V6H4V4ZM4 18H20V20H4V18ZM4 10H20V14H4V10Z");
                text.innerHTML = "積木";
                break;
            case 2:
                editor.setMode('split');
                path.setAttribute("d", "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z");
                text.innerHTML = "分割";
                break;
        }
    }

    render() {
        return html`
        <div id='menubar'>
        <div style='float:left;padding:4px;position:absolute'>
            <img width='36' height='36' src='https://webbit.webduino.io/blockly/media/logo3.png'>
        </div>
        <div style="padding-top: 10px;">
            <div class="toolMenu">
            <div id="button" class='btn'>
                <svg id="icon" viewBox="0 0 24 24">
                    <path id="path"
                        d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                    <path d="M0 0h24v24H0z" fill="none" />
                </svg>
                <span id="text">程式</span>
            </div>
                <slot></slot>
            </div>
        </div>
    </div>
    `;
    }
}
customElements.define('wa-menubar', MenuBar);
