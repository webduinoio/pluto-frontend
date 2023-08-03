export default class PDF {
  constructor() {
    this.msgEle = null;
    this.spanHighlightMap = {};
    this.nowPageNum = 1;
    this.scale = 1; // Initialize scale
  }

  setViewElement(pdfContainer, pageShow) {
    this.pdfContainer = pdfContainer;
    this.elePageShow = pageShow;
    window.qq = this.elePageShow;
  }

  setMsgElement(ele) {
    this.msgEle = ele;
  }

  showMsg(msg1, msg2) {
    if (typeof msg2 != 'undefined') {
      msg1 = msg1 + msg2;
    }
    if (this.msgEle != null) {
      this.msgEle.innerHTML = msg1;
    }
    console.log(msg1);
  }

  async zoomIn(val) {
    if (this.scale > 2) return;
    await this.setViewport(this.scale + val);
  }

  async zoomOut(val) {
    if (this.scale < 0.3) return;
    await this.setViewport(this.scale - val);
  }

  async zoom(val) {
    await this.setViewport(val);
  }

  async load_and_find(url, keyword) {
    var self = this;
    if (this.pdfUrl != url) {
      this.load(url, async function () {
        self.showMsg('find:[' + keyword + ']');
        await self.page(await self.mark(keyword));
      });
    } else {
      await self.page(await self.mark(keyword));
    }
  }

  async load(pdfUrl, callback) {
    if (typeof pdfUrl == 'undefined' || pdfUrl == '') return;
    this.pdfUrl = pdfUrl;
    this.highlightTimeout = 0;
    this.selectedText = '';
    // Initialize PDF.js settings
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      //  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.8.162/pdf.worker.js';
      'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
    this.pdfContainer.addEventListener('scroll', () => {
      // Get all page elements
      const pageElements = Array.from(this.pdfContainer.children);
      // Find the first page element that is (partially) visible in the viewport
      const visiblePageElement = pageElements.find((pageElement) => {
        const rect = pageElement.getBoundingClientRect();
        return rect.top >= 0 && rect.top < window.innerHeight;
      });

      // Update this.nowPageNum
      if (visiblePageElement) {
        this.nowPageNum = parseInt(visiblePageElement.id.split('-')[1]);
        //this.showMsg('Page:', this.nowPageNum);
        this.showPage(this.nowPageNum);
      }
    });

    try {
      this.pdfContainer.innerHTML = '';
      this.showMsg('PDF loading...', pdfUrl);
      this.loadingEffect(true);
      let loadingTask = pdfjsLib.getDocument({
        url: this.pdfUrl,
        cMapUrl: '/public/cmaps/',
        rangeChunkSize: 65536,
        //disableRange: false,
      });
      loadingTask.promise.then(async (pdf) => {
        this.pdfDoc = pdf;
        const unscaledViewport = (await pdf.getPage(1)).getViewport({ scale: 1 });
        this.scale = this.pdfContainer.clientWidth / unscaledViewport.width;
        //let lastPromise = Promise.resolve(); // Start with a promise that always resolves
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          //lastPromise = lastPromise.then(() => this.renderPage(pdf, pageNum)); // Chain the promises
          await this.renderPage(pdf, pageNum);
        }
        this.loadingEffect(false);
        if (typeof callback != 'undefined') callback();
      });
    } catch (error) {
      // Handle any errors that occur during loading
      console.error('Error loading PDF:', error);
    }
    //this.showPage();
    this.showMsg('PDF loading...done.');
  }

  async setViewport(scale) {
    this.scale = scale;
    for (let pageNum = 1; pageNum <= this.pdfDoc.numPages; pageNum++) {
      await this.setPageScale(pageNum);
    }
  }

  async mark(markStr) {
    if (markStr == null) return;
    this.clearMark();
    let verifyLength = markStr.length;
    let verifyCnt = 0;
    // 選擇所有的span元素
    let elements = this.pdfContainer.querySelectorAll('span');
    let spans = [];
    let findPage = '';
    let kewordNotFound = true;
    let _spanHighlightMap = {};
    elements.forEach(function (element) {
      spans.push(element);
    });

    outerLoop: for (var idx in spans) {
      var words = spans[idx].textContent;
      var sameSpanCnt = 0;
      var startMatch = 0;

      for (var w in words) {
        let mark = markStr.substring(verifyCnt, verifyCnt + 1);
        if (words[w] == mark) {
          // debugger;
          kewordNotFound = false;
          if (sameSpanCnt == 0) {
            startMatch = parseInt(w);
            _spanHighlightMap[idx] = { start: startMatch };
          }
          var end = ++sameSpanCnt + startMatch;
          _spanHighlightMap[idx]['ele'] = spans[idx];
          _spanHighlightMap[idx]['end'] = end;
          _spanHighlightMap[idx]['cnt'] = words.substring(startMatch, end);
          _spanHighlightMap[idx]['page'] = parseInt(
            spans[idx].parentElement.parentElement.id.substring(5)
          );
          //console.log(`set:${idx}.${verifyCnt}`, _spanHighlightMap[idx]);
          if (verifyCnt++ == verifyLength - 1) {
            if (findPage == '') {
              var pageId = spans[idx].parentElement.parentElement.id;
              findPage = parseInt(pageId.substring(5));
            }
            this.spanHighlightMap = _spanHighlightMap;
            //console.log(`add[1]:${idx}`, _spanHighlightMap);
            break outerLoop;
          }
        } else {
          verifyCnt = 0;
          sameSpanCnt = 0;
          kewordNotFound = true;
          _spanHighlightMap = {};
        }
      }
      if (kewordNotFound && typeof _spanHighlightMap[idx] != 'undefined') {
        //console.log('del[2]:', _spanHighlightMap[idx]);
        //delete _spanHighlightMap[idx];
        _spanHighlightMap = {};
      }
    }
    // highlight
    for (var spanIdx in this.spanHighlightMap) {
      var cnt = elements[spanIdx].innerHTML;
      var replaceStr = cnt.substring(
        this.spanHighlightMap[spanIdx]['start'],
        this.spanHighlightMap[spanIdx]['end']
      );
      var highlightStr = `<span class='pdfContainer-mark'>${replaceStr}</span>`;
      cnt = cnt.replace(replaceStr, highlightStr);
      elements[spanIdx].innerHTML = cnt;
      elements[spanIdx].scrollIntoView({ block: 'start' });
      /*
      var top = elements[spanIdx].getBoundingClientRect().y;
      setTimeout(function () {
        window.scrollBy(0, top < 10 ? -10 : -1 * top + 10);
      }, 200);
      //*/
    }
    return findPage;
  }

  clearMark() {
    for (var spanIdx in this.spanHighlightMap) {
      var text = this.spanHighlightMap[spanIdx]['ele'].innerHTML;
      var replaceStr = this.spanHighlightMap[spanIdx]['cnt'];
      var highlightStr = `<span class="pdfContainer-mark">${replaceStr}</span>`;
      var newText = text.replace(highlightStr, replaceStr);
      this.spanHighlightMap[spanIdx]['ele'].innerHTML = newText;
    }
    this.spanHighlightMap = {};
  }

  lastPage() {
    this.page(this.nowPage() - 1);
  }

  nextPage() {
    this.page(this.nowPage() + 1);
  }

  nowPage() {
    return this.nowPageNum;
  }

  showPage() {
    if (typeof this.elePageShow.value == 'number') {
      this.elePageShow.value = this.nowPageNum;
    } else {
      this.elePageShow.innerHTML = `${this.nowPageNum} / ${this.pdfDoc.numPages}`;
    }
  }

  page(pageNum) {
    if (pageNum == '') return;
    this.nowPageNum = pageNum;
    // Scroll to the specified page
    var pageDiv = document.getElementById('page-' + pageNum);
    if (pageDiv) {
      pageDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  loadingEffect(show) {
    var ele = this.pdfContainer;
    var overlay = ele.getElementsByClassName('pdfContainer-overlay')[0];
    if (show && !overlay) {
      overlay = document.createElement('div');
      overlay.className = 'pdfContainer-overlay';
      var loading = document.createElement('div');
      loading.className = 'pdfContainer-loading';
      loading.textContent = '檔案下載中...';
      overlay.appendChild(loading);
      ele.appendChild(overlay);
    } else if (!show && overlay) {
      ele.removeChild(overlay);
    }
  }

  async setPageScale(pageNum) {
    const page = await this.pdfDoc.getPage(pageNum);
    if (this.scale == -1) {
      const unscaledViewport = (await this.pdfDoc.getPage(1)).getViewport({ scale: 1 });
      this.scale = this.pdfContainer.clientWidth / unscaledViewport.width;
    }
    var viewport = page.getViewport({ scale: this.scale });
    var pageDiv = document.getElementById('page-' + pageNum);
    var canvas = pageDiv.children[0];
    var textLayerDiv = pageDiv.children[1];
    textLayerDiv.style.setProperty('--scale-factor', this.scale);
    var outputScale = window.devicePixelRatio || 1;
    // Set up the canvas
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + 'px';
    canvas.style.height = Math.floor(viewport.height) + 'px';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    // Set up the pageDiv
    pageDiv.style['height'] = canvas.style.height;
    pageDiv.style['width'] = canvas.style.width;
    var context = canvas.getContext('2d');
    var transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
    var renderContext = {
      canvasContext: context,
      transform: transform,
      viewport: viewport,
    };
    // Render the page onto the canvas
    await page.render(renderContext).promise;
  }

  async renderPage(pdf, pageNum) {
    var self = this;
    //this.showMsg('load :', this.scale);
    const page = await pdf.getPage(pageNum);
    var viewport = page.getViewport({ scale: this.scale }); // Use the current scale
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var textLayerDiv = document.createElement('div');
    var pageDiv = document.createElement('div');

    // Set an ID for the pageDiv
    pageDiv.id = 'page-' + pageNum;

    // Set up pageDiv
    pageDiv.style.position = 'relative';
    pageDiv.style.width = viewport.width + 'px';
    pageDiv.style.height = viewport.height + 'px';
    pageDiv.style.marginBottom = '20px';

    // Set up text layer
    textLayerDiv.className = 'textLayer';
    textLayerDiv.style.width = '100%';
    textLayerDiv.style.height = '100%';
    textLayerDiv.style.position = 'absolute';
    textLayerDiv.style.top = '0';
    textLayerDiv.style.left = '0';
    textLayerDiv.style.setProperty('--scale-factor', this.scale);

    var outputScale = window.devicePixelRatio || 1;

    // Set up the canvas
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + 'px';
    canvas.style.height = Math.floor(viewport.height) + 'px';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';

    var transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

    var renderContext = {
      canvasContext: context,
      transform: transform,
      viewport: viewport,
    };

    // Append elements to the pageDiv
    pageDiv.appendChild(canvas);
    pageDiv.appendChild(textLayerDiv);

    // Render the page onto the canvas
    await page.render(renderContext).promise;

    //*/ Render the text layer
    // Retrieve the text content and render it onto the textLayer
    const textContent = await page.getTextContent();
    pdfjsLib.renderTextLayer({
      textContentSource: textContent,
      container: textLayerDiv,
      viewport: viewport,
      textDivs: [],
      enhanceTextSelection: true,
      textContentStream: true,
    });
    //*/
    // Append the rendered page to the container
    this.pdfContainer.appendChild(pageDiv);
    // Add event listener for text selection
    textLayerDiv.addEventListener('mouseup', function (event) {
      var selectedRange = window.getSelection().getRangeAt(0);
      this.selectedText = selectedRange.toString().trim();
      console.log('>>>>', this.selectedText);
      // 移除現有的圖標，如果有的話
      var existingIcon = document.getElementById('clickable-icon');
      if (existingIcon) {
        existingIcon.remove();
      }
      if (this.selectedText.trim() == '') return;

      // 创建一个新的图像元素作为图标
      var icon = document.createElement('img');
      icon.id = 'clickable-icon';
      icon.src =
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAwADAAAD/4QCSRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgExAAIAAAARAAAAWodpAAQAAAABAAAAbAAAAAAAAADAAAAAAQAAAMAAAAABcGFpbnQubmV0IDQuMC4yMQAAAAKgAgAEAAAAAQAAABigAwAEAAAAAQAAABgAAAAA/+EJbWh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0icGFpbnQubmV0IDQuMC4yMSIvPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz4A/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAAOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/iB9hJQ0NfUFJPRklMRQABAQAAB8hhcHBsAiAAAG1udHJSR0IgWFlaIAfZAAIAGQALABoAC2Fjc3BBUFBMAAAAAGFwcGwAAAAAAAAAAAAAAAAAAAAAAAD21gABAAAAANMtYXBwbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC2Rlc2MAAAEIAAAAb2RzY20AAAF4AAAFimNwcnQAAAcEAAAAOHd0cHQAAAc8AAAAFHJYWVoAAAdQAAAAFGdYWVoAAAdkAAAAFGJYWVoAAAd4AAAAFHJUUkMAAAeMAAAADmNoYWQAAAecAAAALGJUUkMAAAeMAAAADmdUUkMAAAeMAAAADmRlc2MAAAAAAAAAFEdlbmVyaWMgUkdCIFByb2ZpbGUAAAAAAAAAAAAAABRHZW5lcmljIFJHQiBQcm9maWxlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABtbHVjAAAAAAAAAB8AAAAMc2tTSwAAACgAAAGEZGFESwAAACQAAAGsY2FFUwAAACQAAAHQdmlWTgAAACQAAAH0cHRCUgAAACYAAAIYdWtVQQAAACoAAAI+ZnJGVQAAACgAAAJoaHVIVQAAACgAAAKQemhUVwAAABIAAAK4a29LUgAAABYAAALKbmJOTwAAACYAAALgY3NDWgAAACIAAAMGaGVJTAAAAB4AAAMocm9STwAAACQAAANGZGVERQAAACwAAANqaXRJVAAAACgAAAOWc3ZTRQAAACYAAALgemhDTgAAABIAAAO+amFKUAAAABoAAAPQZWxHUgAAACIAAAPqcHRQTwAAACYAAAQMbmxOTAAAACgAAAQyZXNFUwAAACYAAAQMdGhUSAAAACQAAARadHJUUgAAACIAAAR+ZmlGSQAAACgAAASgaHJIUgAAACgAAATIcGxQTAAAACwAAATwcnVSVQAAACIAAAUcZW5VUwAAACYAAAU+YXJFRwAAACYAAAVkAFYBYQBlAG8AYgBlAGMAbgD9ACAAUgBHAEIAIABwAHIAbwBmAGkAbABHAGUAbgBlAHIAZQBsACAAUgBHAEIALQBwAHIAbwBmAGkAbABQAGUAcgBmAGkAbAAgAFIARwBCACAAZwBlAG4A6AByAGkAYwBDHqUAdQAgAGgA7ABuAGgAIABSAEcAQgAgAEMAaAB1AG4AZwBQAGUAcgBmAGkAbAAgAFIARwBCACAARwBlAG4A6QByAGkAYwBvBBcEMAQzBDAEOwRMBD0EOAQ5ACAEPwRABD4ERAQwBDkEOwAgAFIARwBCAFAAcgBvAGYAaQBsACAAZwDpAG4A6QByAGkAcQB1AGUAIABSAFYAQgDBAGwAdABhAGwA4QBuAG8AcwAgAFIARwBCACAAcAByAG8AZgBpAGyQGnUoAFIARwBCgnJfaWPPj/DHfLwYACAAUgBHAEIAINUEuFzTDMd8AEcAZQBuAGUAcgBpAHMAawAgAFIARwBCAC0AcAByAG8AZgBpAGwATwBiAGUAYwBuAP0AIABSAEcAQgAgAHAAcgBvAGYAaQBsBeQF6AXVBeQF2QXcACAAUgBHAEIAIAXbBdwF3AXZAFAAcgBvAGYAaQBsACAAUgBHAEIAIABnAGUAbgBlAHIAaQBjAEEAbABsAGcAZQBtAGUAaQBuAGUAcwAgAFIARwBCAC0AUAByAG8AZgBpAGwAUAByAG8AZgBpAGwAbwAgAFIARwBCACAAZwBlAG4AZQByAGkAYwBvZm6QGgBSAEcAQmPPj/Blh072TgCCLAAgAFIARwBCACAw1zDtMNUwoTCkMOsDkwO1A70DuQO6A8wAIAPAA8EDvwPGA68DuwAgAFIARwBCAFAAZQByAGYAaQBsACAAUgBHAEIAIABnAGUAbgDpAHIAaQBjAG8AQQBsAGcAZQBtAGUAZQBuACAAUgBHAEIALQBwAHIAbwBmAGkAZQBsDkIOGw4jDkQOHw4lDkwAIABSAEcAQgAgDhcOMQ5IDicORA4bAEcAZQBuAGUAbAAgAFIARwBCACAAUAByAG8AZgBpAGwAaQBZAGwAZQBpAG4AZQBuACAAUgBHAEIALQBwAHIAbwBmAGkAaQBsAGkARwBlAG4AZQByAGkBDQBrAGkAIABSAEcAQgAgAHAAcgBvAGYAaQBsAFUAbgBpAHcAZQByAHMAYQBsAG4AeQAgAHAAcgBvAGYAaQBsACAAUgBHAEIEHgQxBEkEOAQ5ACAEPwRABD4ERAQ4BDsETAAgAFIARwBCAEcAZQBuAGUAcgBpAGMAIABSAEcAQgAgAFAAcgBvAGYAaQBsAGUGRQZEBkEAIAYqBjkGMQZKBkEAIABSAEcAQgAgBicGRAY5BicGRQAAdGV4dAAAAABDb3B5cmlnaHQgMjAwNyBBcHBsZSBJbmMuLCBhbGwgcmlnaHRzIHJlc2VydmVkLgBYWVogAAAAAAAA81IAAQAAAAEWz1hZWiAAAAAAAAB0TQAAPe4AAAPQWFlaIAAAAAAAAFp1AACscwAAFzRYWVogAAAAAAAAKBoAABWfAAC4NmN1cnYAAAAAAAAAAQHNAABzZjMyAAAAAAABDEIAAAXe///zJgAAB5IAAP2R///7ov///aMAAAPcAADAbP/AABEIABgAGAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2wBDAAEBAQEBAQIBAQIDAgICAwQDAwMDBAYEBAQEBAYHBgYGBgYGBwcHBwcHBwcICAgICAgJCQkJCQsLCwsLCwsLCwv/2wBDAQICAgMDAwUDAwULCAYICwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwv/3QAEAAL/2gAMAwEAAhEDEQA/APRP+Cdv/BIz4l/tvaKvxY8W6yPBnw/897aG+ESzX2oyxMVdbSNyI1RWBRppAwLAhEbBav3Fm/4N6v2Fbfw4NKm17xcl8Yz/AKc2qxBt6jJfyTB5HHUrs2+2Kd8AvD8v7VX/AATN/Z8n/ZtZ5Lv4eax4bl1PTba/XT3WbQ5BHfQySPHINykGVQQPMBDAncDXG/Ez9lH/AIKRfFvT9VtPiNYWmu2+paH4g0yC1udbhzYTa9pc1nKIpvJ3vb+esRUPhgjlgEIMdfL0cLRp0ov2Lm2k7621+WlvS/c/q/iPjniHMc2xEf7ajgadKpUh7K8YSioNqN7tOo5bvmajvy/yn42/8FFP+CRPxO/Yf0M/FrwprH/CY/D8zRwS3zQiC+0+SYhYxdIh8to3YhFnjCqGIDoMhq/H7fF/z0j/AO/i/wCNf22ftHaz8Qv2f/8Agkt8TPDf7b9/bap4m1Cy1LRbaSGdZLbUZ9RHl6fHZxqiNCkYZE8tgWj8ppGdxlz/AAlf8I9F/wBCk3/gUf8AGvNzDC06VRcj5U0nZ3uvL+vyP1zwz47zvMcrq/XKDxUqVWVNVqVlGooqLUtrX97dKOlrpSuf/9D5Z/Zo/a6/aG/ZD8WyeL/gF4km0WS72Le2roLmxvETgCe2c7HKjhXBSRRwHA4r9wviL/wcS/FL/hU3g7T/AIVeFtKPjWbTQ3ii81KGf+z4L77uyyhSVXkXjzGZ5Ni5CKzkMw/mrqWX7sP/AFz/AKmvzujjK9GLjTm0n/WnY/1H4g8OuHc7xVPG5ng4zqQ62s5aWSm1ZyS3Sbdml0un9GftLftd/tEfte+LIvF/x/8AEk2tS2m8WdoiC3sbNX4IgtkOxCRwzsXkYcFyOK+bNi+gp1FYSk5Nyk7vzPqsDgMNg6EMLhKUadOKsoxSjFLySskf/9k=';
      icon.style.position = 'absolute';
      icon.style.left =
        event.pageX - textLayerDiv.getBoundingClientRect().left + window.scrollX + 'px'; // 考虑滚动和容器偏移
      icon.style.top =
        event.pageY - textLayerDiv.getBoundingClientRect().top + window.scrollY + 'px'; // 考虑滚动和容器偏移
      icon.style.cursor = 'pointer'; // 让它看起来是可点击的
      // 添加點擊事件處理器
      icon.addEventListener('click', function () {
        console.log('OK');
      });

      // 將圖標附加到textLayerDiv
      document.getElementsByTagName('body').appendChild(icon);

      setTimeout(function () {
        self.showMsg(self.selectedText);
      }, 1000);
    });

    textLayerDiv.addEventListener('___mouseover', function (event) {
      //console.log('event:', event);
      if (this.highlightTimeout) clearTimeout(this.highlightTimeout);

      this.highlightTimeout = setTimeout(function () {
        var target = event.target;

        // Skip if the target is not a span (i.e., not a text element)
        if (target.tagName.toLowerCase() !== 'span') return;

        // Remove all existing highlights
        var highlightedElements = document.querySelectorAll('.pdfContainer-highlight');
        highlightedElements.forEach(function (element) {
          element.classList.remove('pdfContainer-highlight');
        });

        // Get the position of the target element
        var targetRect = target.getBoundingClientRect();

        // Get all text elements
        var textElements = Array.from(textLayerDiv.getElementsByTagName('span'));

        // Function to check if an element is in the same block as the target
        var isInSameBlock = function (element) {
          var rect = element.getBoundingClientRect();

          // Check if the element is in the same line as the target
          // This is a simple check and might not work correctly for all PDFs
          return Math.abs(rect.top - targetRect.top) < rect.height * 3;
        };

        // Get all elements in the same block
        var sameBlockElements = textElements.filter(isInSameBlock);

        if (sameBlockElements.length) {
          self.showMsg(
            'Text block:',
            sameBlockElements
              .map(function (element) {
                return element.textContent;
              })
              .join(' ')
          );

          // Highlight all elements in the same block
          sameBlockElements.forEach(function (element) {
            element.classList.add('pdfContainer-highlight');
          });
        }
      }, 1000);
    });
  }
}
