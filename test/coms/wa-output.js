import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'

/**
 * filename：wa-output.js
 * descript：程式輸出畫面 (Python終端輸出)，包含右上角一個清除畫面的按鈕，顯示 python print 資料
 * Author: Marty
 * Date: 2022/02
 */
export class Output extends LitElement {
    constructor() {
        super();
    }

    static styles = [css`
    #output-title {
        width: calc(100% - 9px);
        font-size: 20px;
        height: 32px;
        line-height: 32px;
        color: #Fefefe;
        background-color: #707070;
        padding-left: 10px;
        user-select: none;
    }

    input[type=text] {
        background-color: #000;
        color: #fff;
        border: none;
        width: 100%; 
        height: 1em;
        font-size:1.2em;
        padding: 0.0em;
    }    
    p{
        display: block;
        margin-block-start: 0em;
        margin-block-end: 0em;
        font-size:1.2em;
    }    
    #output-console {
        height: 10em;
        padding: 0.5em;
        font-size:1.2em;
        height: calc(100% - 52px);
        width: calc(100% - 19px);
        color: #Fefefe;
        background-color: #303030;
        overflow: scroll;
    }
    svg {
        fill: #eee;
        width: 24px;
        height: 24px;
    }
    #clear {
        transition: transform 0.3s ease-out;
    }      
    #clear:hover {
        transform: rotate(45deg);
    }    
  `];

    async addInput(cb) {
        var output = this.output;
        var input = document.createElement("input");
        input.type = "text";
        input.placeholder = "輸入文字，按 Enter 結束";
        input.addEventListener("keydown", function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                var text = this.value.trim();
                if (text !== "") {
                    var p = document.createElement("p");
                    p.textContent = text;
                    output.appendChild(p);
                    cb(text);
                }
                output.removeChild(this);
            }
        });
        output.appendChild(input);
        input.focus();
    }

    scrollBottom() {
        const distance = this.output.scrollHeight - this.output.scrollTop;
        const speed = distance / 300; // 每毫秒滾動的距離
        const interval = 10;
        let currentPosition = this.output.scrollTop;
        var self = this;
        const scroll = setInterval(function () {
            currentPosition += speed * interval;
            self.output.scrollTop = currentPosition;
            if (currentPosition >= self.output.scrollHeight) {
                clearInterval(scroll);
            }
        }, interval);

    }

    cls() {
        this.output.innerHTML = '';
        this.output.data = '';
    }

    show(msg) {
        this.output.innerHTML = this.output.innerHTML + ("<p>" + msg + "</p>");
        this.output.data = this.output.data + msg + "\n";
    }

    showErr(msg) {
        this.output.innerHTML = this.output.innerHTML +
            "<p><span style='color:red'>" + msg + "</span></p>";
    }

    getMsg() {
        return this.output.innerHTML;
    }

    getOutputData() {
        return this.output.data;
    }

    firstUpdated() {
        //*/
        if (typeof (window.Main) != "undefined") {
            window.Main.registry("output", this);
        }
        //*
        this.output = this.renderRoot.getElementById("output-console");
        this.clear = this.renderRoot.getElementById("clear");
        var self = this;
        this.clear.addEventListener('click', function () {
            self.output.innerHTML = '';
            self.output.data = '';
        })
    }

    render() {
        return html`
    <div id='output-title'>Python 終端輸出
        <svg id='clear' viewBox="0 0 24 24" width="24" height="24" style='float:right;padding:4px'>
            <path d="M19.28 4.68a10 10 0 0 0-14.2 1.42l1.41 1.41a8 8 0 0 1 11.32-1.13L16 7h6V1l-1.42 1.42z"/>
            <path d="M4.7 19.28a10 10 0 0 0 14.2-1.42l-1.41-1.41a8 8 0 0 1-11.31 1.13L8 17H2v6l1.42-1.42z"/>
        </svg>    
    </div>
    <div id="output-console"><slot></slot></div>
`;
    }
}
// 
customElements.define('wa-output', Output);
