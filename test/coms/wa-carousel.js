import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'

class ImageSlider extends LitElement {
  static get properties() {
    return {
      index: { type: Number },
      images: { type: Array },
    };
  }

  static get styles() {
    return css`
          :host {
            display: block;
          }
    
          .container {
            position: relative;
            overflow: hidden;
          }
    
          #previous,
          #next {
            position: absolute;
            top: 90%;
            transform: translateY(-50%);
            width: 40px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            font-size: 30px;
            color: rgba(0, 0, 0, 0.5);
            background-color: rgba(0, 0, 0, 0.1);
            cursor: pointer;
          }
    
          #previous {
            left: 0;
          }
    
          #next {
            right: 0;
          }
    
          .slider {
            display: flex;
            overflow-x: scroll;
            scroll-behavior: smooth;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            overflow: hidden;
          }
    
          .slider img {
            flex: 0 0 100%;
            height: auto;
            scroll-snap-align: center;
          }
    
          .dots {
            display: flex;
            justify-content: center;
            margin-top: 10px;
          }
    
          .dots li {
            width: 10px;
            height: 10px;
            margin: 0 5px;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.5);
            cursor: pointer;
            transition: background-color 0.5s ease;
          }
    
          .dots li.dot--active {
            background-color: white;
          }
        `;
  }

  constructor() {
    super();
    this.selectCallback = function () { };
    this.index = 0;
    this.lastIdx = -1;
    this.images = [
      ['python', 'https://md.webduino.io/uploads/upload_44bd52bfc96a03cba7e9002db46d9996.png', '100px'],
      ['webbit', 'https://webbit.webduino.io/blockly/simulator/dist/preview-bit.3c165d12.png', '100px'],
    ];
  }

  firstUpdated() {
    this.next = this.shadowRoot.getElementById('next');
    this.previous = this.shadowRoot.getElementById('previous');
    this.switchImg();
  }

  render() {
    return html`
          <div class="container">
            <span id="previous" @click=${() => this.switchImg(--this.index)}>＜</span>
            <span id="next" @click=${() => this.switchImg(++this.index)}>＞</span>
            <div id="slider" class="slider">
              ${this.images.map((image) => html`<img style="max-width: 100%; width:100%;height:auto" src=${image[1]} />`)}
            </div>
          </div>
        `;
  }

  select(callback) {
    this.selectCallback = callback;
  }

  switchImg() {
    this.index = this.index < 0 ? 0 : this.index;
    this.index = this.index == this.images.length ? this.images.length - 1 : this.index;

    if (this.lastIdx != this.index) {
      this.lastIdx = this.index;

      if (this.index == 0) {
        this.previous.style['display'] = 'none';
      } else {
        this.previous.style['display'] = 'block';
      }
      if (this.index == this.images.length - 1) {
        this.next.style['display'] = 'none';
      } else {
        this.next.style['display'] = 'block';
      }
      this.selectCallback(this.index, this.images[this.index][0]);
      const imgWidth = this.shadowRoot.querySelector('.slider img').clientWidth;
      const recomputedWidth = this.index * imgWidth;
      this.shadowRoot.querySelector('.slider').scrollTo({ left: recomputedWidth, behavior: 'smooth' });
    }
  }
}

customElements.define('wa-carousel', ImageSlider);