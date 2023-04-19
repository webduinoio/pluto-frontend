import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'

class WAFlowchart extends LitElement {
  static get properties() {
    return {
      scale: { type: Number },
      offsetX: { type: Number },
      offsetY: { type: Number },
      isDragging: { type: Boolean },
      startX: { type: Number },
      startY: { type: Number },
    };
  }
  static get styles() {
    return css`
        /* Define div styles */
        #container {
          width: 800px;
          height: 600px;
          border: 1px solid black;
          position: relative;
          overflow: hidden;
        }
         /* Define image styles */
        #image {
          width: 320px;
          height: 240px;
          position: absolute;
          left: 25%;
          top: 25%;
          cursor: move;
        }
         /* Define button styles */
        #zoom-in,
        #zoom-out {
          position: absolute;
          bottom: 10px;
          padding: 10px;
          font-size: 20px;
          background-color: white;
          border: none;
          cursor: pointer;
        }
         #zoom-in {
          right: 60px;
        }
         #zoom-out {
          right: 10px;
        }
      `;
  }
  constructor() {
    super();
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.startX = 0;
    this.startY = 0;
    this.isDragging = false;
  }

  firstUpdated() {
    this.container = this.shadowRoot.getElementById('container');
    this.image = this.shadowRoot.getElementById('image');
  }

  render() {
    return html`
        <div id="container">
          <img
            id="image"
            src="https://images.unsplash.com/photo-1535026793569-5a810fda9660"
            @mousedown="${this.onMouseDown}"
            @mousemove="${this.onMouseMove}"
            @mouseup="${this.onMouseUp}"
          />
          <button id="zoom-in" @click="${this.zoomIn}">+</button>
          <button id="zoom-out" @click="${this.zoomOut}">-</button>
        </div>
      `;
  }
  onMouseDown(e) {
    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    let image = this.image;
    this.offsetX = image.offsetLeft;
    this.offsetY = image.offsetTop;
  }
  onMouseMove(e) {
    if (this.isDragging) {
      let dx = e.clientX - this.startX;
      let dy = e.clientY - this.startY;
      let image = this.image;
      image.style.left = this.offsetX + dx + 'px';
      image.style.top = this.offsetY + dy + 'px';
      this.checkBounds();
    }
  }

  onMouseUp(e) {
    this.isDragging = false;
  }

  zoomIn() {
    let image = this.image;
    let container = this.container;
    // Calculate the image's center point before scaling
    var centerX = (image.offsetLeft - container.offsetLeft) + image.offsetWidth / 2;
    var centerY = (image.offsetTop - container.offsetTop) + image.offsetHeight / 2;

    // Increase the scale and update image's width and height
    this.scale += 0.1;
    image.style.width = this.scale * image.offsetWidth + "px";
    image.style.height = this.scale * image.offsetHeight + "px";

    // Update image's left and top attributes to maintain the center point
    image.style.left = (container.offsetLeft + centerX) - image.offsetWidth / 2 + "px";
    image.style.top = (container.offsetTop + centerY) - image.offsetHeight / 2 + "px";

    // Check if the image is out of the div's bounds
    this.checkBounds();
  }

  zoomOut() {
    let image = this.image;
    let container = this.container;

    // Calculate the image's center point before scaling
    var centerX = (image.offsetLeft - container.offsetLeft) + image.offsetWidth / 2;
    var centerY = (image.offsetTop - container.offsetTop) + image.offsetHeight / 2;

    // Decrease the scale and update image's width and height
    this.scale -= 0.1;
    image.style.width = this.scale * image.offsetWidth + "px";
    image.style.height = this.scale * image.offsetHeight + "px";

    // Update image's left and top attributes to maintain the center point
    image.style.left = (container.offsetLeft + centerX) - image.offsetWidth / 2 + "px";
    image.style.top = (container.offsetTop + centerY) - image.offsetHeight / 2 + "px";

    // Check if the image is out of the div's bounds
    this.checkBounds();
  }

  checkBounds() {
    let image = this.image;
    let container = this.container;
    // 如果圖片的左側或上側超出了 div 的範圍，則將其設置為最小的值 
    if (image.offsetLeft < container.offsetLeft) {
      //image.style.left = container.offsetLeft + "px";
    }
    if (image.offsetTop < container.offsetTop) {
      //image.style.top = container.offsetTop + "px";
    }
    // 如果圖片的右側或下側超出了 div 的範圍，則將其設置為最大的值 
    if (image.offsetLeft + image.offsetWidth > container.offsetLeft + container.offsetWidth) {
      //image.style.left = container.offsetLeft + container.offsetWidth - image.offsetWidth + "px";
    }
    if (image.offsetTop + image.offsetHeight > container.offsetTop + container.offsetHeight) {
      //image.style.top = container.offsetTop + container.offsetHeight - image.offsetHeight + "px";
    }
  }
}

customElements.define('wa-flow', WAFlowchart);