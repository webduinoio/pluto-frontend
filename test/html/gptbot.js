var genCode = '';
var wholeMsg = '';
var isCode = false;
var _codeType = -1; // 0:flow , 1:python
var _codeBlockCount = 0; // code block
const cookie = new Cookie(2);
const textarea = document.getElementById('show');
const voice = document.getElementById('voice');
const carousel = document.getElementById('carousel');
const md2html = parent.document.getElementById('md2html');
var info = parseURL(parent.location.href);
const app = new MQTTApp(info['userId'] + "_" + Math.random());

function voiceToTextarea(str) {
    if (str.trim() == '') return;
    gpt.prompt(str);
}

function appendToShow(msg, isEnd) {
    var nowActorName = carousel.getActorName();
    if (nowActorName == 'gpt35') {
        actorGPT35(msg, isEnd);
    } else {
        actorDefault(msg, isEnd);
    }
}

function actorGPT35(msg, isEnd) {
    try {
        console.log(isEnd, wholeMsg);
        if (isEnd) {
            var uuid = msg.split('\n\n$UUID$')[1];
            if (typeof (uuid) != "undefined") {
                msg = msg.split('\n\n$UUID$')[0];
                gpt.setUUID(uuid);
            }
            gpt.done();
            gpt.wholeMsg = wholeMsg;
            md2html.setText(wholeMsg);
            gpt.setEnable(true);
        }
        if (msg == '') return;
        wholeMsg = wholeMsg + "\n" + msg;
        switch (codeBlock.parseLine(msg, isEnd)) {
            case 0:
                genCode = '';
                var cnt = gpt.read();
                cnt = cnt + msg + "<br>";
                gpt.write(cnt);
                break;
            case 1: //parseing
            case 2: //end parse
                break;
        }
    } catch (e) {
        console.log("[function appendToShow(msg, isEnd)] parse meg error:", e);
    }
}

function actorDefault(msg, isEnd) {
    try {
        if (isEnd) {
            var uuid = msg.split('\n\n$UUID$')[1];
            if (typeof (uuid) != "undefined") {
                msg = msg.split('\n\n$UUID$')[0];
                gpt.setUUID(uuid);
            }
            var info = parseURL(parent.location.href);
            if (info['actor'] == 'wbit') {
                parent.Main.coms['deploy'].setEnable(true);
            }
            gpt.done();
            gpt.wholeMsg = wholeMsg;
            parent.flow.done();
            // fix dirty codegen
            var code = parent.editor.getCode();
            code = code.replace('from webduino import WebBit', 'from webduino.webbit import WebBit');
            code = code.replace('from Webbit import Webbit', 'from webduino.webbit import WebBit');
            code = code.replace('webbit = Webbit()', 'webbit = WebBit()');
            code = code.replace('wbit.no_tone(0)', '');
            code = code.replace('wbit.tone(0,', 'wbit.tone(');
            parent.editor.setCode(code);
            gpt.setEnable(true);
        }
        if (msg == '') return;
        wholeMsg = wholeMsg + "\n" + msg;
        switch (codeBlock.parseLine(msg, isEnd)) {
            case 0:
                genCode = '';
                var cnt = gpt.read();
                cnt = cnt + msg + "<br>";
                gpt.write(cnt);
                break;
            case 1: //parseing
            case 2: //end parse
                break;
        }
    } catch (e) {
        console.log("[function appendToShow(msg, isEnd)] parse meg error:", e);
    }
}

async function init() {
    parent.Main.registry("app", app);
    parent.Main.registry("gpt", gpt);
    parent.Main.registry("voice", voice);
    //parent.Main.registry("deploy", deploy);
    parent.Main.registry("flow", parent.flow);
    parent.Main.registry("carousel", carousel);
    parent.Main.registry("editor", parent.editor);
    gpt.setMQTT(app);
    gpt.prompt(info['prompt']);
    await app.init(appendToShow);

    codeBlock.addCallback(
        function (pyCode, isEnd) {
            if (pyCode != '') {
                parent.editor.setCode(pyCode);
            }
        }, function (gpCode, isEnd) {
            //check content available
            if (gpCode.length > 80) {
                let fixCode = gpCode;
                let left = fixCode.split('{').length - 1;
                let right = fixCode.split('}').length - 1;
                let add = left - right;
                for (i = 0; i < add; i++) {
                    fixCode += "}";
                }
                try {
                    parent.flow.setCode(fixCode);
                } catch (e) {
                    console.log("Error:", e);
                    console.log("flow:\n", fixCode);
                }
            }
        });
    parent.editor.setCode("");
    //將事件轉發到 Main
    carousel.select(function (idx, name) {
        parent.Main.eventTrigger("carousel", "setActor", [idx, name]);
    });
    carousel.setActor(info['actor'], true);
    setTimeout(function () {
        gpt.setEnable(true);
    }, 1000);

    gpt.promptCallback(function (prompt) {
        parent.Main.coms['output'].cls();
        if (parent.Main.coms['mqtt'].failure) {
            alert('連線中斷，請重新整理網頁');
        }
        gpt.setEnable(false);
        parent.location.hash =
            '#' + info['userId'] +
            '?prompt=' + encodeURIComponent(prompt) +
            '&actor=' + carousel.actor;
        wholeMsg = '';
        genCode = '';
        isCode = false;
        _codeType = -1; // -1:none , 0:python , 1:flow
        _codeBlockCount = 0;
        //console.log("prompt callback:", prompt);
        app.publish(carousel.actor + ":" + prompt);
        gpt.start(carousel.actor);
        parent.Main.coms['deploy'].setEnable(false);
        parent.flow.processing();
        parent.editor.setCode("");
    });
}