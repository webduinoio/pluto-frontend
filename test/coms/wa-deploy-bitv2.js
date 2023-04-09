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
            background-color: #ee3c71;
            color: #fff;
            cursor: pointer;
        }
        svg {
            fill: #eee;
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
            <svg viewBox="-2 0 20 20">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                    <title>usb [#193]</title>
                    <desc>Created with Sketch.</desc>
                    <defs> </defs>
                    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="Dribbble-Light-Preview" transform="translate(-60.000000, -7319.000000)" fill="#FFFFFF">
                        <g id="icons" transform="translate(56.000000, 160.000000)">
                        <path d="M20,7167 L18.744,7167 C17.996,7171 15,7171.95 13,7171.95 L13,7178 C13,7178.552 12.552,7179 12,7179 C11.448,7179 11,7178.552 11,7178 L11,7175.95 C8,7175.95 5.699,7174.603 5.108,7170.808 C4.469,7170.474 4.003,7169.813 4.003,7169.042 C4.003,7167.937 4.902,7167.042 6.007,7167.042 C7.111,7167.042 8.013,7167.937 8.013,7169.042 C8.013,7169.746 7.66,7170.362 7.11,7170.718 C7.553,7173.274 9,7173.891 11,7174.014 L11,7164 L8.948,7164 L11.948,7159 L14.948,7164 L13,7164 L13,7170.004 C15,7169.852 16.245,7169 16.744,7167 L16,7167 L16,7163 L20,7163 L20,7167 Z" id="usb-[#193]"></path>
                        </g>
                    </g>
                    </g>
                </g>
            </svg>
            <span id='msg'> 部署</span>
            </button>
        `;
    }
}
customElements.define('wa-deploy-bitv2', DeployBitV2);
