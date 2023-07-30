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
        this.showMsg('Page:', this.nowPageNum);
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
        let lastPromise = Promise.resolve(); // Start with a promise that always resolves
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          //lastPromise = lastPromise.then(() => this.renderPage(pdf, pageNum)); // Chain the promises
          await this.renderPage(pdf, pageNum);
        }
        this.loadingEffect(false);
        callback();
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
    this.elePageShow.innerHTML = `${this.nowPageNum} / ${this.pdfDoc.numPages}`;
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
    this.showMsg('load :', this.scale);
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
    textLayerDiv.addEventListener('___mouseup', function (event) {
      var selectedRange = window.getSelection().getRangeAt(0);
      this.selectedText = selectedRange.toString().trim();
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
