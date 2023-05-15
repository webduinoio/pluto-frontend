
class CodeBlock {
    constructor() {
        this.reset();
        this.pyCB = function (code) { console.log("pyCode:\n", code) };
        this.gpCB = function (code) { console.log("gpCode:\n", code) };
    }

    reset() {
        this.codeType = -1;          //0:python,1:flow
        this.strCodeType = '';
        this.inCodeBlock = false;
        this.codeFirstLine = true;
        this.pythonCode = '';
        this.graphvizCode = '';
        this.fixSign = false;
    }

    addCallback(pyCB, gpCB) {
        this.pyCB = pyCB;
        this.gpCB = gpCB;
    }

    parseLine(data, isEnd) {
        var line = data.trim();
        // not start codeBlock
        if (!this.inCodeBlock && !line.startsWith('```')) {
            return 0;
        }
        // end codeBlock
        if (this.inCodeBlock && line.startsWith("```")) {
            if (this.fixSign) {
                this.graphvizCode = this.graphvizCode + "}";
            }
            this.pyCB(this.pythonCode);
            this.gpCB(this.graphvizCode);
            this.reset();
            return 2; // parse done.
        }
        // start codeBlock
        if (!this.inCodeBlock && line.startsWith("```")) {
            this.inCodeBlock = true;
            this.strCodeType = line.substring(3).trim();
            return 1; //parsing...
        }
        if (this.strCodeType == 'python') {
            this.codeType = 0;
        }
        else if (this.strCodeType == 'dot' ||
            this.strCodeType == 'flow' ||
            this.strCodeType == 'mermaid' ||
            this.strCodeType == 'graphviz' ||
            this.strCodeType.startsWith('digraph')) {
            this.codeType = 1;
        }
        if (this.codeType == -1 && this.codeFirstLine) {
            if (line.startsWith("#") ||
                line.startsWith("import") ||
                line.startsWith("for") ||
                line.startsWith("print")) {
                this.codeType = 0;
                this.codeFirstLine = false;
            } else if (line.startsWith("digraph")) {
                this.codeType = 1;
                this.codeFirstLine = false;
            }
        }
        if (this.codeType == 1 && this.codeFirstLine) {
            this.codeFirstLine = false;
            // fix: ```digraph{
            if (line.indexOf("{") == -1) {
                data = "{\n" + data;
                this.fixSign = true;
            }
        }
        switch (this.codeType) {
            case 0: // Python
                this.pythonCode = this.pythonCode + (data + "\n");
                this.pyCB(this.pythonCode);
                break;
            case 1: // Graphviz
                // fix: }```
                if (data.indexOf('```') >= 0) {
                    this.graphvizCode = this.graphvizCode + "}";
                    this.pyCB(this.pythonCode);
                    this.gpCB(this.graphvizCode);
                    this.reset();
                    return 2; //end
                }
                this.graphvizCode = this.graphvizCode + (data + "\n");
                this.gpCB(this.graphvizCode);
                break;
        }
        return 1;
    }
}