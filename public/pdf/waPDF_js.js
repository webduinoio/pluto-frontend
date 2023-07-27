export default class PDF {
  constructor() {
    this.pdfContainer = document.getElementById('pdfContainer');
  }

  showMsg(msg1) {
    console.log(msg1);
  }

  async load_and_find(url, keyword) {
    if (this.pdfUrl != url) {
      await this.load(url);
    }
    await this.find(keyword);
  }

  async load(pdfUrl) {
    if (typeof pdfUrl == 'undefined' || pdfUrl == '') return;
    this.pdfUrl = pdfUrl;
    this.scale = 1; // Initialize scale
    this.highlightTimeout = 0;
    this.selectedText = '';
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
    this.pdfContainer.addEventListener('scroll', () => {
      const pageElements = Array.from(this.pdfContainer.children);
      const visiblePageElement = pageElements.find((pageElement) => {
        const rect = pageElement.getBoundingClientRect();
        return rect.top >= 0 && rect.top < window.innerHeight;
      });

      if (visiblePageElement) {
        this.nowPageNum = parseInt(visiblePageElement.id.split('-')[1]);
      }
    });

    try {
      this.pdfContainer.innerHTML = '';
      const pdfDoc = await pdfjsLib.getDocument(this.pdfUrl).promise;
      this.pdfDoc = pdfDoc;
      const page = await this.pdfDoc.getPage(1);
      const unscaledViewport = page.getViewport({ scale: 1 });
      this.scale = this.pdfContainer.clientWidth / unscaledViewport.width;
      await new Promise((r) => setTimeout(r, 500));
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        await this.renderPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }

  async count(keyword, n = 0) {
    let keywordWithoutSpaces = keyword.replace(/\s+/g, '');
    let pages = [];
    for (let pageNum = 1; pageNum <= this.pdfDoc.numPages; pageNum++) {
      const page = await this.pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      let textItems = textContent.items.map((item) => item.str);
      let pageText = textItems.join('');
      let pageTextWithoutSpaces = pageText.replace(/\s+/g, '');
      let matchIndex = 0;
      let matchStart = -1;
      for (let i = 0, j = 0; i < pageText.length && j < pageTextWithoutSpaces.length; i++) {
        if (pageText[i] === ' ') {
          continue;
        }

        if (pageTextWithoutSpaces[j] === keywordWithoutSpaces[matchIndex]) {
          if (matchIndex === 0) {
            matchStart = i;
          }
          matchIndex++;
        } else {
          matchStart = -1;
          matchIndex = 0;
        }
        j++;
        if (matchIndex === keywordWithoutSpaces.length) {
          let realKeyword = pageText.slice(matchStart, i + 1 + n); // Extract the real keyword from the original page text
          pages.push([pageNum, realKeyword]); // Add the page number and the real keyword to the array
          matchIndex = 0; // Reset matchIndex to find all matches on the page
        }
      }
    }
    return pages;
  }

  async mark(keyword) {
    // Ensure the document is loaded
    if (!this.pdfDoc) {
      console.error('PDF document not loaded');
      return;
    }

    const pages = await this.count(keyword, keyword.length);

    for (let i = 0; i < pages.length; i++) {
      let [pageNum, match] = pages[i];
      let pageDiv = document.getElementById('page-' + pageNum);

      if (!pageDiv) {
        console.error('Could not find div for page ' + pageNum);
        continue;
      }

      let textLayerDiv = pageDiv.querySelector('.textLayer');

      if (!textLayerDiv) {
        console.error('Could not find text layer for page ' + pageNum);
        continue;
      }

      let spans = Array.from(textLayerDiv.getElementsByTagName('span')); // Convert to array to prevent infinite loop
      for (let j = 0; j < spans.length; j++) {
        let span = spans[j];
        if (span.textContent.includes(keyword)) {
          // Only replace spans that contain the keyword
          let spanText = span.textContent;
          // Use a regular expression with capturing groups to separate the text before, the keyword, and the text after the keyword
          let regex = new RegExp(`(.*?)(${keyword})(.*)`);
          let match = spanText.match(regex);
          if (match) {
            let [_, before, keywordMatch, after] = match;
            // Create a new span element to hold the highlighted keyword
            let keywordSpan = document.createElement('span');
            keywordSpan.className = 'pdfContainer-highlight';
            keywordSpan.textContent = keywordMatch;
            // Replace the span's text with the text before the keyword, the highlighted keyword, and the text after the keyword
            span.innerHTML = before + keywordSpan.outerHTML + after;
          }
        }
      }
    }
  }

  async search(keyword) {
    // First, count the keyword
    const matches = await this.count(keyword, 0);
    // Filter out any matches that are empty strings
    const validMatches = matches.filter((match) => match[1].trim() !== '');
    // Then, mark each keyword
    for (const match of validMatches) {
      const [pageNum, matchedText] = match;
      await this.mark(matchedText);
    }
    // Return the valid matches
    return validMatches;
  }

  /** */

  nowPage() {
    return this.nowPageNum;
  }

  page(pageNum) {
    this.nowPageNum = pageNum;
    // Scroll to the specified page
    var pageDiv = document.getElementById('page-' + pageNum);
    if (pageDiv) {
      pageDiv.scrollIntoView();
    }
  }

  async renderPage(pageNum, keyword = null) {
    var self = this;
    const page = await this.pdfDoc.getPage(pageNum);
    var viewport = page.getViewport({ scale: this.scale });
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var textLayerDiv = document.createElement('div');
    var pageDiv = document.createElement('div');

    pageDiv.id = 'page-' + pageNum;

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

    // Set up the canvas
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';

    pageDiv.appendChild(canvas);
    pageDiv.appendChild(textLayerDiv);

    const textContent = await page.getTextContent();

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    pdfjsLib.renderTextLayer({
      textContentSource: textContent,
      container: textLayerDiv,
      viewport: viewport,
      textDivs: [],
      enhanceTextSelection: true,
      textContentStream: true,
    });
    this.pdfContainer.appendChild(pageDiv);
    textLayerDiv.addEventListener('mouseup', function (event) {
      var selectedRange = window.getSelection().getRangeAt(0);
      this.selectedText = selectedRange.toString().trim();
      setTimeout(function () {
        self.showMsg(self.selectedText);
      }, 1000);
    });

    textLayerDiv.addEventListener('XXXmouseover', function (event) {
      //console.log('event:', event);
      if (this.highlightTimeout) clearTimeout(this.highlightTimeout);

      this.highlightTimeout = setTimeout(function () {
        var target = event.target;

        if (target.tagName.toLowerCase() !== 'span') return;

        var highlightedElements = document.querySelectorAll('.pdfContainer-highlight');
        highlightedElements.forEach(function (element) {
          element.classList.remove('pdfContainer-highlight');
        });

        var targetRect = target.getBoundingClientRect();

        var textElements = Array.from(textLayerDiv.getElementsByTagName('span'));

        var isInSameBlock = function (element) {
          var rect = element.getBoundingClientRect();
          return Math.abs(rect.top - targetRect.top) < rect.height * 3;
        };

        var sameBlockElements = textElements.filter(isInSameBlock);
        if (sameBlockElements.length) {
          self.showMsg(
            'Text block:' +
              sameBlockElements
                .map(function (element) {
                  return element.textContent;
                })
                .join(' ')
          );
          sameBlockElements.forEach(function (element) {
            element.classList.add('pdfContainer-highlight');
          });
        }
      }, 1000);
    });
  }
}
