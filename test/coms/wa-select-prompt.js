import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'

class MenuTextarea extends LitElement {
  static get properties() {
    return {
      options: { type: Array },
    };
  }

  static get styles() {
    return css`
      .my-select {
        margin: 5px;
        font-size: 1.2em;
        padding: 5px;
        padding-top:0px;
        width:calc(100% - 10px);
      }
    `;
  }

  constructor() {
    super();
    this.options = [{ text: '選擇範例', value: '' }];
  }

  connectedCallback() {
    super.connectedCallback();
    //fetch('./challenge.json')
    fetch('./gptbot.json')
      .then(response => response.json())
      .then(data => {
        this.options = this.options.concat(data);
        this.requestUpdate();
      })
      .catch(error => {
        console.error(error);
      });
  }

  render() {
    return html`
      <select id="mySelect" @change="${this._handleSelectChange}" class="my-select">
        ${this.options.map(
      option =>
        html`
              <option value="${encodeURIComponent(option.value)}">
                ${option.text}
              </option>
            `
    )}
      </select>
    `;
  }

  _handleSelectChange(event) {
    const selectedValue = decodeURIComponent(event.target.value);
    const gpt = document.getElementById('gpt');
    gpt.prompt(selectedValue);
  }
}

customElements.define('wa-select-prompt', MenuTextarea);
