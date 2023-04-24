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
    
          .title {
            position: absolute;
            #background-color: rgba(133, 0, 0, 0.1);
            top: 85%;
            right:50px;
            transform: translateY(-70%);
            width: 245px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            font-size: 20px;
            color: rgba(0, 0, 0, 0.5);
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
      ['python', 'Python 助教', '../coms/python_logo.png', '140px'],
      ['wbit', '控制 Web:Bit v2開發板', '../coms/wbitv2.png', '280px'],
      //['kebbi','../coms/kebbi.png', '320px'],
    ];
    this.actor = this.images[this.index][0];
    this.loadImages();
  }

  setActor(actorName, focus) {
    if (arguments.length == 2 && focus) this.lastIdx = -1;
    for (var i = 0; i < this.images.length; i++) {
      if (this.images[i][0] == actorName) {
        this.index = i;
        this.switchImg();
        break;
      }
    }
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
      return downloadImage(image[2]);
    });
    // 等到所有圖片都下載完畢後，再繼續執行後面的程式碼
    Promise.all(promises).then(function (images) {
      // 所有圖片都下載完畢，可以繼續執行後面的程式碼了
      //console.log('所有圖片都下載完畢！');
      // ...
    }).catch(function (url) {
      // 有圖片下載失敗，可以在這裡處理錯誤
      console.log('下載圖片失敗：' + url);
    });
  }

  firstUpdated() {
    this.next = this.shadowRoot.getElementById('next');
    this.previous = this.shadowRoot.getElementById('previous');
    this.descript = this.shadowRoot.getElementById('title');
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
        <span id="title" class="title"></span>
        <div id="slider" class="slider">
          ${this.images.map((image) => html`<img style="max-width: 100%; width:100%;height:${image[3]}" src=${image[2]} />`)}
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
      this.descript.innerHTML = this.images[this.index][1];
      this.selectCallback(this.index, this.images[this.index][0]);
      const imgWidth = this.shadowRoot.querySelector('.slider img').clientWidth;
      const recomputedWidth = this.index * imgWidth;
      this.shadowRoot.querySelector('.slider').scrollTo({ left: recomputedWidth, behavior: 'smooth' });
    }
  }
}

customElements.define('wa-carousel', ImageSlider);