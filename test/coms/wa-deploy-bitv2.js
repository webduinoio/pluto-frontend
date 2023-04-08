import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'

export class DeployBitV2 extends LitElement {

    static properties = {
        console: {},
    };

    constructor() {
        super();
    }

    static styles = [css`
        button {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1em;
            font-weight: bold;
            padding: 4px;
            border: none;
            border-radius: 5px;
            background-color: #2e3c71;
            color: #fff;
            cursor: pointer;
        }
        svg {
            fill: #ee0;
            width: 24px;
            height: 24px;
            display: inline-block;
            vertical-align: middle;
        }  
        #msg {
            display: inline-block;
            vertical-align: middle;
        }
    `];

    async firstUpdated() {
        let self = this;
        self.repl = new REPL();
        const usb = this.renderRoot.querySelector("#usb");
        const msg = this.renderRoot.querySelector("#msg");
        usb.addEventListener('click', async function (e) {
            msg.innerHTML = '部署中';
            await self.repl.usbConnect();
            var code = parent.editor.getCode();
            var writeLen = await self.repl.uploadFile(code);
            msg.innerHTML = writeLen > 0 ? '完成' : '失敗';
            setTimeout(function () {
                msg.innerHTML = '部署';
            }, 1500);
        });
    }

    render() {
        return html`
            <button id='usb' class='btn'>
                <svg viewBox="0 0 24 28">
                    <rect x="0" y="0" width="24" height="24" fill="#0aa"/>
                    <path d="M 6 8 L 6 16 L 9 16 L 9 12 L 15 12 L 15 16 L 18 16 L 18 8 Z M 9 8 L 9 10 L1510L158Z" fill="white"/>
                </svg>
                <span id='msg'> 部署</span>
            </button>
        `;
    }
}
customElements.define('wa-deploy-bitv2', DeployBitV2);
