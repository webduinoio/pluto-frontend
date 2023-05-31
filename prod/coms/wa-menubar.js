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
        width:145px;
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
                path.setAttribute("d", "M11.7925 5.04509C11.9243 4.98497 12.0757 4.98497 12.2075 5.04509L18.2075 7.78193C18.3857 7.8632 18.5 8.04101 18.5 8.23684V15.0789C18.5 15.2585 18.4037 15.4243 18.2477 15.5133L12.2477 18.9344C12.0942 19.0219 11.9058 19.0219 11.7523 18.9344L5.75234 15.5133C5.59632 15.4243 5.5 15.2585 5.5 15.0789V8.23684C5.5 8.04101 5.61433 7.8632 5.7925 7.78193L11.7925 5.04509ZM6.5 9.04163L11.5 11.5124V17.6393L6.5 14.7885V9.04163ZM12.5 17.6393L17.5 14.7885V9.04163L12.5 11.5124V17.6393ZM12 10.644L16.8348 8.25491L12 6.04956L7.16519 8.25491L12 10.644Z");
                text.innerHTML = "積木";
                break;
            case 2:
                editor.setMode('split');
                path.setAttribute("d", "M10.22,17.28a.75.75,0,0,1,0-1.06l1.72-1.72H5.75A5.757,5.757,0,0,1,0,8.75a.75.75,0,0,1,1.5,0A4.254,4.254,0,0,0,5.75,13h6.188L10.22,11.281a.75.75,0,0,1,1.061-1.061l3,3a.75.75,0,0,1,0,1.06l-3,3a.75.75,0,0,1-1.061,0ZM16,8.75A4.255,4.255,0,0,0,11.75,4.5H5.56L7.28,6.22A.75.75,0,0,1,6.22,7.28l-3-3a.751.751,0,0,1,0-1.061l3-3A.75.75,0,0,1,7.28,1.281L5.561,3H11.75A5.756,5.756,0,0,1,17.5,8.75a.75.75,0,0,1-1.5,0Z");
                text.innerHTML = "分割";
                break;
        }
    }

    render() {
        return html`
        <div id='menubar'>
        <div style='float:left;padding:4px;position:absolute'>
            <img height='36' src='./prod/coms/webduino_logo.svg' style='margin-left:5px'>
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
