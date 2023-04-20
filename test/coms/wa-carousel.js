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
            top: 85%;
            transform: translateY(-70%);
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
            align-items: center; /* 垂直置中 */            
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
      ['python', 'https://md.webduino.io/uploads/upload_44bd52bfc96a03cba7e9002db46d9996.png', '140px'],
      ['wbit', '../coms/wbitv2.png', '250px'],
    ];
    this.actor = this.images[this.index][0];
    this.loadImages();
  }

  loadImages() {
    // 定義一個 Promise 物件，用來下載一張圖片
    function downloadImage(url) {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () {
          resolve(img);
        };
        img.onerror = function () {
          reject(url);
        };
        img.src = url;
      });
    }

    // 建立一個 Promise 陣列，用來下載所有圖片
    var promises = this.images.map(function (image) {
      return downloadImage(image[1]);
    });

    // 等到所有圖片都下載完畢後，再繼續執行後面的程式碼
    Promise.all(promises).then(function (images) {
      // 所有圖片都下載完畢，可以繼續執行後面的程式碼了
      console.log('所有圖片都下載完畢！');
      // ...
    }).catch(function (url) {
      // 有圖片下載失敗，可以在這裡處理錯誤
      console.log('下載圖片失敗：' + url);
    });
  }

  firstUpdated() {
    this.next = this.shadowRoot.getElementById('next');
    this.previous = this.shadowRoot.getElementById('previous');
    var self = this;
    setTimeout(function () {
      self.switchImg();
    }, 10);
  }

  render() {
    return html`
      <div class="container">
        <span id="previous" @click=${() => this.switchImg(--this.index)}>＜</span>
        <span id="next" @click=${() => this.switchImg(++this.index)}>＞</span>
        <div id="slider" class="slider">
          ${this.images.map((image) => html`<img style="max-width: 100%; width:100%;height:${image[2]}" src=${image[1]} />`)}
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
      this.actor = this.images[this.index][0];
      this.selectCallback(this.index, this.images[this.index][0]);
      const imgWidth = this.shadowRoot.querySelector('.slider img').clientWidth;
      const recomputedWidth = this.index * imgWidth;
      this.shadowRoot.querySelector('.slider').scrollTo({ left: recomputedWidth, behavior: 'smooth' });
    }
  }
}

customElements.define('wa-carousel', ImageSlider);