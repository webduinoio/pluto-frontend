class FixFlow {
    constructor() {
        this._enhance = {};
        this._cvt = {};
    }
    parseStringToObject(str) {
        const obj = {};
        const regex = /([^=,\s]+)=("[^"]+"|[^,]+)/g;
        let match;

        while ((match = regex.exec(str))) {
            const key = match[1];
            const val = match[2].replace(/"/g, '');
            obj[key] = val;
        }
        return obj;
    }

    parseNode(q) {
        // 利用正規表達式擷取節點名稱和屬性字串
        //const matches = q.match(/"*(\w+)"*\s*\[(.+)\]/);
        const matches = q.match(/"*([\w\u4e00-\u9fa5]+)"*\s*\[(.+)\]/);

        if (matches == null) return [null, null];
        const nodeName = matches[1];
        var hasSpace = q.indexOf(nodeName + " ") >= 0 ? ' ' : '';
        const attrString = matches[2];
        // 將屬性字串轉換成物件
        const attrObj = this.parseStringToObject(attrString);
        const takeString = nodeName + hasSpace + "[" + attrString + "]";
        // 組成最終的物件
        const obj = {};
        obj[nodeName] = attrObj;
        return [takeString, obj];
    }

    toText(obj) {
        const nodeName = Object.keys(obj)[0];
        const attrs = obj[nodeName];
        const attrString = Object.keys(attrs)
            .map(key => `${key}="${attrs[key]}"`).join(', ');
        return `${nodeName} [${attrString}]`;
    }

    cvt(obj) {
        const keyName = Object.keys(obj)[0];
        const valObj = obj[keyName];
        //console.log("valObj['label']:", valObj['label'], " ,keyName:", keyName);
        var process = false;
        if (typeof valObj['label'] == 'undefined') {
            //console.log("cvt:", keyName, valObj);
            valObj['label'] = keyName.replaceAll('"', '');
        }
        // 加工 '開始'
        if (valObj['label'].indexOf("開始") >= 0 || keyName.indexOf("開始") >= 0
            || valObj['label'].indexOf("結束") >= 0 || keyName.indexOf("結束") >= 0
            || valObj['label'].indexOf("start") >= 0 || keyName.indexOf("start") >= 0
            || valObj['label'].indexOf("end") >= 0 || keyName.indexOf("end") >= 0
        ) {
            this._cvt[keyName] = valObj;
            valObj['shape'] = 'oval';
            process = true;
        }
        // 加工 '判斷' '比較'
        if (valObj['label'].indexOf("判斷") >= 0 || keyName.indexOf("判斷") >= 0
            || valObj['label'].indexOf("比較") >= 0 || keyName.indexOf("比較") >= 0
            || valObj['label'].indexOf("嗎") >= 0 || keyName.indexOf("嗎") >= 0
            || valObj['label'].indexOf("是否") >= 0 || keyName.indexOf("是否") >= 0
            || valObj['label'].indexOf("檢查") >= 0 || keyName.indexOf("檢查") >= 0) {
            this._cvt[keyName] = valObj;
            valObj['shape'] = 'diamond';
            process = true;
        }
        // 加工 '輸入、輸出'
        if (valObj['label'].indexOf("輸入") >= 0 || keyName.indexOf("輸入") >= 0
            || valObj['label'].indexOf("輸出") >= 0 || keyName.indexOf("輸出") >= 0) {
            this._cvt[keyName] = valObj;
            valObj['shape'] = 'parallelogram';
            process = true;
        }
        return process ? this.toText(obj) : "";
    }

    addEnhance(nodeNames, line) {
        var nodes = line.split('->');
        for (var i in nodes) {
            var nodeName = nodes[i].trim().replace(";", "");
            if (!nodeName.startsWith('"') && nodeName.indexOf("{") == -1
                && (nodeName.indexOf("[") == -1 ||
                    (nodeName.indexOf("[") >= 0 && nodeName.indexOf("=") == -1))) {
                nodeNames[nodeName] = '';
            }
            var nodeValue = '';
            if (nodeName.indexOf("[") >= 0 && nodeName.indexOf("=") > 0) {
                nodeValue = nodeName.split("[")[1].trim();
                nodeName = nodeName.split("[")[0].trim();
            }
            if (nodeName.indexOf("開始") >= 0
                || nodeName.indexOf("結束") >= 0
                || nodeName.indexOf("判斷") >= 0
                || nodeName.indexOf("輸入") >= 0
                || nodeName.indexOf("輸出") >= 0
                || nodeName.indexOf("start") >= 0
                || nodeName.indexOf("end") >= 0
            ) {
                if (nodeName in this._cvt) {
                    //console.log("skip:", nodeName);
                    return;
                }
                this._enhance[nodeName] = nodeValue;
                //console.log("node:", nodeName, nodeValue);
            }
        }
        return nodeNames;
    }

    // shape enhance
    combineEnhance(data) {
        var lines = "\n";
        for (var key in this._enhance) {
            var obj = {};
            obj[key] = { "shape": "" };
            lines += "\n" + this.cvt(obj);
        }
        var pos = data.lastIndexOf("}");
        data = data.substring(0, pos) + lines + "\n" + data.substring(pos);
        //console.log(">>>>>>>>>>>>>>>\n", data);
        //reset enhance
        this._enhance = {};
        this._cvt = {};
        return data;
    }

    isNumeric(str) {
        return !isNaN(str);
    }

    hasChineseCharacters(str) {
        //        var pattern = /[\u4e00-\u9fff]/; // 中文字符的 Unicode 範圍
        //        var pattern = /[\u4e00-\u9fff]|[a-zA-Z0-9]/; // 包含中文字符、英文字母和数字的 Unicode 範圍
        var pattern = /[\u4e00-\u9fff]|[a-zA-Z0-9._\s]/; // 包含中文字符、英文字母、数字、.、空白字符和下划线的 Unicode 範圍
        return pattern.test(str);
    }

    fixNodeNames(collectFixNodeNames, ndata) {
        var id2Key = {};
        var idx = 0;
        const sortedKeys = Object.keys(collectFixNodeNames).sort((a, b) => b.length - a.length);
        for (var i in sortedKeys) {
            if (!this.hasChineseCharacters(sortedKeys[i])) continue;
            //if (this.isNumeric(sortedKeys[i])) continue;
            var id = '##' + (++idx) + '##';
            id2Key[id] = sortedKeys[i];
            ndata = ndata.replaceAll(sortedKeys[i], '"' + id + '"');
        }
        //*
        for (var key in id2Key) {
            ndata = ndata.replaceAll(key, id2Key[key]);
        }
        //*/
        ndata = ndata.replaceAll('""', '"');
        return ndata;
    }

    convert(viz) {
        var ndata = viz;
        ndata = ndata.replaceAll('""', '"');
        var collectFixNodeNames = {};
        var data = viz.split('\n');
        for (var i in data) {
            if (data[i].trim().startsWith('node[') ||
                data[i].trim().startsWith('node [')) {
                ndata = ndata.replaceAll(data[i], '');
                continue;
            }
            if (data[i].indexOf("->") > 0) {
                this.addEnhance(collectFixNodeNames, data[i]);
                continue;
            }
            var obj = null;
            var [matchStr, obj] = this.parseNode(data[i]);
            if (obj != null) {
                var cvtStr = this.cvt(obj);
                if (cvtStr != "")
                    ndata = ndata.replace(matchStr, cvtStr);
            }
        }
        ndata = this.combineEnhance(ndata);
        ndata = this.fixNodeNames(collectFixNodeNames, ndata);
        ndata = ndata.replace("rankdir=\"LR\";", "");
        ndata = ndata.replace("rankdir = \"LR\";", "");
        ndata = ndata.replace("rankdir=LR;", "");
        ndata = ndata.replace("rankdir = LR;", "");
        //找第一個{
        var startPos = ndata.indexOf("{");
        ndata = `digraph {
rankdir=TB
node[shape=box, style=filled, fillcolor=lightyellow];
`+ ndata.substring(startPos + 1);
        //console.log(">>>>>>>>>>>>\n", ndata);
        return ndata;
    }
}

var ff = new FixFlow();
//console.log(ff.convert(viz));