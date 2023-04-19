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

  processing() {
    const div = document.createElement('div');
    this.clear();
    this.ele.appendChild(div);
    div.style['width'] = '100px';
    div.style['font-size'] = '32px';
    div.style['color'] = '#ccc';
    div.style.display = 'flex';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    const texts = ['.', '..', '...'];
    let index = 0;
    this.intervalId = setInterval(() => {
      div.textContent = `${texts[index]}`;
      index = (index + 1) % texts.length;
    }, 250);
  }

  clear() {
    clearInterval(this.intervalId);
    while (this.ele.firstChild) {
      this.ele.removeChild(this.ele.firstChild);
    }
  }

  setCode(code) {
    try {
      this.graph = code;
      const imgEle = Viz(this.graph, { format: 'png-image-element', engine: 'dot' });
      this.clear();
      this.ele.appendChild(imgEle);
    } catch (e) {
      //console.log("flow:", e);
    }
  }
}

customElements.define('wa-flow', WAFlowchart);
