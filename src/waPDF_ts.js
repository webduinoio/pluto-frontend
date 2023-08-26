export default class PDF {
  constructor(selectItem) {
    this.selectItem = selectItem;
    this.msgEle = null;
    this.spanHighlightMap = {};
    this.nowPageNum = 1;
    this.scale = 1; // Initialize scale
    this.injectAskPrompt = function () {};
  }

  b64ToUTF8(base64Part) {
    // Base64解碼
    let decodedBytes;
    try {
      decodedBytes = new Uint8Array(
        [...atob(base64Part)].map((character) => character.charCodeAt(0))
      );
    } catch (e) {
      return 'err:' + e;
    }
    const decoder = new TextDecoder('utf-8');
    const decodedStr = decoder.decode(decodedBytes);
    // 將解碼的字串解析為JSON物件
    let jsonObj;
    try {
      jsonObj = JSON.parse(decodedStr);
    } catch (e) {
      console.error('JSON parsing failed:', e.message);
      return;
    }
    // 拿到 'file' 的文件名（去除副檔名）
    const filename = jsonObj['file'];
    const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'));
    // 返回不包括副檔名的文件名
    return nameWithoutExtension;
  }

  setInjectAskPrompt(callback) {
    this.injectAskPrompt = callback;
  }

  setViewElement(pdfContainer, pageShow, totalPages) {
    this.pdfContainer = pdfContainer;
    this.vueCurrentPage = pageShow;
    this.vueTotalPages = totalPages;
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
    this.selectItem(this.b64ToUTF8(url.split('/books/docs/')[1]));
    var self = this;
    if (this.pdfUrl != url) {
      this.load(url, async function () {
        await self.page(await self.mark(keyword), function () {});
        setTimeout(async function () {
          var findPage = await self.mark(keyword);
          //console.log(keyword + ':findPage...' + findPage);
          self.pdfDoc.nowPage = parseInt(findPage);
          self.vueCurrentPage.value = self.pdfDoc.nowPage;
          self.showMsg('find:[' + keyword + '],page:' + findPage);
          await self.page(findPage, function () {
            self.vueCurrentPage.value = self.pdfDoc.nowPage;
            self.vueTotalPages.vaue = self.pdfDoc.numPages;
          });
        }, 0);
      });
    } else {
      var findPage = await self.mark(keyword);
      if (findPage != '') {
        findPage = parseInt(findPage);
        self.vueCurrentPage.value = findPage;
        setTimeout(async function () {
          await self.page(findPage, function () {});
        }, 0);
      }
    }
  }

  async load(pdfUrl, callback) {
    if (typeof pdfUrl == 'undefined' || pdfUrl == '' || this.pdfUrl == pdfUrl) return;
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
      if (visiblePageElement && visiblePageElement.id != '') {
        this.nowPageNum = parseInt(visiblePageElement.id.split('-')[1]);
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
        rangeChunkSize: 65536 * 4,
        //disableRange: false,
      });
      this.vueCurrentPage.value = 0;
      this.vueTotalPages.value = 0;
      loadingTask.promise.then(async (pdf) => {
        this.pdfDoc = pdf;
        const unscaledViewport = (await pdf.getPage(1)).getViewport({ scale: 1 });
        this.scale = this.pdfContainer.clientWidth / unscaledViewport.width;
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          this.vueTotalPages.value = pageNum;
          await this.renderPage(pdf, pageNum);
        }
        this.loadingEffect(false);
        this.vueCurrentPage.value = 1;
        if (typeof callback != 'undefined') callback();
      });
    } catch (error) {
      // Handle any errors that occur during loading
      console.error('Error loading PDF:', error);
    }
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
      elements[spanIdx].scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  lastPage(callback) {
    var swPage = this.nowPage() - 1;
    this.page(swPage, callback);
  }

  nextPage(callback) {
    var swPage = this.nowPage() + 1;
    this.page(swPage, callback);
  }

  nowPage() {
    return this.nowPageNum;
  }

  showPage() {
    if (typeof this.vueCurrentPage.value == 'number') {
      this.vueCurrentPage.value = this.nowPageNum;
    } else {
      this.vueCurrentPage.innerHTML = `${this.nowPageNum} / ${this.pdfDoc.numPages}`;
    }
    if (typeof this.vueTotalPages.value == 'number') {
      this.vueTotalPages.value = this.pdfDoc.numPages;
    }
  }

  page(pageNum, callback) {
    var self = this;
    if (pageNum == '') return;
    var pageDiv = document.getElementById('page-' + pageNum);
    if (pageDiv == null) {
      return;
    }
    self.nowPageNum = parseInt(pageNum);
    setTimeout(function () {
      pageDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      callback(self.nowPageNum);
    }, 10);
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
      // 移除現有的圖標，如果有的話
      function removeIcon() {
        var existingIcon = document.getElementById('clickable-icon');
        if (existingIcon) {
          existingIcon.remove();
        }
      }
      removeIcon();
      if (this.selectedText.trim() == '') return;
      var icon = document.createElement('img');
      icon.id = 'clickable-icon';
      icon.src =
        'data:image/png;base64,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';
      icon.style.position = 'absolute';
      var rect = selectedRange.getBoundingClientRect();
      icon.style.left = 10 + rect.right + 'px';
      icon.style.top = -10 + rect.top + window.scrollY + 'px';
      icon.style.cursor = 'pointer';
      icon.style['z-index'] = '2';
      // 添加點擊事件處理器
      var askText = this.selectedText;
      icon.addEventListener('click', function () {
        removeIcon();
        self.injectAskPrompt(askText);
      });
      // 將圖標附加到textLayerDiv
      document.getElementsByTagName('body')[0].appendChild(icon);
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
