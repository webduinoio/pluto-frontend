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
        this.ele = this.parentElement;
    }

    render() {
        return html``;
    }

    output(strDigraph) {
        this.graph = strDigraph;
        var imgEle = Viz(this.graph, { format: 'png-image-element', engine: 'dot' });
        this.ele.removeChild(this.ele.firstChild);
        this.ele.appendChild(imgEle);
    }
}

customElements.define('wa-flow', WAFlowchart);