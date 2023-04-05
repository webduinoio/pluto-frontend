import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'

export class DeployBitV2 extends LitElement {

    static properties = {
        console: {},
    };

    constructor() {
        super();
    }

    static styles = [css`
    svg {
        fill: #ee0;
        width: 24px;
        height: 24px;
    }  
    .btn {
        transition: all 0.5s ease;
        cursor: pointer;
        color: #aaa;
        float:left;
        font-size: 16px;
        display: flex;
        align-items: center; 
        width:80px;
    }
    .btn:hover {
        transform: translateY(-3px);
        color: #eee;
    }
    .btn svg + span {
        margin-left: 1px;
      }     
  `];

    async firstUpdated() {
        let self = this;
        self.repl = new REPL();
        const usb = this.renderRoot.querySelector("#usb");
        const icon = this.renderRoot.querySelector("#icon");
        const msg = this.renderRoot.querySelector("#msg");
        usb.addEventListener('click', async function (e) {
            msg.innerHTML = '部署中';
            await self.repl.usbConnect();
            var code = editor.getCode();
            var writeLen = await self.repl.uploadFile(code);
            msg.innerHTML = writeLen > 0 ? '完成' : '失敗';
            setTimeout(function () {
                msg.innerHTML = '部署';
            }, 1500);
        });
    }

    render() {
        return html`
        <div id='usb' class='btn'>
            <svg id='icon' viewBox="0 0 24 24">
                <rect x="0" y="0" width="24" height="24" fill="#0aa"/>
                <path d="M 6 8 L 6 16 L 9 16 L 9 12 L 15 12 L 15 16 L 18 16 L 18 8 Z M 9 8 L 9 10 L1510L158Z" fill="white"/>
            </svg>
            <span id='msg'> 部署</span>
        </div>
        `;
    }
}
customElements.define('wa-deploy-bitv2', DeployBitV2);
