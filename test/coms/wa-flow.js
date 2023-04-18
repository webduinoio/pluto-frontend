import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'

class WAFlowchart extends LitElement {

  constructor() {
    super();
  }

  static get styles() {
    return css`
          :host {
            --my-element-margin: 0px;
            margin: var(--my-element-margin);
          }
        `;
  }

  firstUpdated() {
    this.ele = this.shadowRoot;
  }

  render() {
    return html`<h1 style="color:#ccc">流程圖</h1>`;
  }

  clear() {
    while (this.ele.firstChild) {
      this.ele.removeChild(this.ele.firstChild);
    }
  }

  setCode(code) {
    try {
      this.graph = code;
      var imgEle = Viz(this.graph, { format: 'png-image-element', engine: 'dot' });
      this.clear();
      this.ele.appendChild(imgEle);
    } catch (e) {
      //console.log("flow:", e);
    }
  }
}

customElements.define('wa-flow', WAFlowchart);