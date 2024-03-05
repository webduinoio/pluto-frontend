let eleBlockmirror = document.getElementById('blockmirror-editor');
let parentElement = eleBlockmirror.parentElement;

var editor = new BlockMirror({
    'container': eleBlockmirror,
    'height': parentElement,
    'toolbox': 'wa', // empty, minimal , ct , normal , full,
    'viewMode': 'text', // text , split ,block
});

// resize detect
new ResizeObserver(function () {
    editor.blockEditor.blockMirror.configuration.height = parentElement.offsetHeight;
    editor.textEditor.blockMirror.configuration.height = parentElement.offsetHeight;
    editor.textEditor.resizeResponsively();
    editor.refresh();
}).observe(parentElement);
// editor autocomplete
//*
const ignore = ['', '#', '!', '-', '=', '@', '$', '%', '&', '+', ';', '(', ')', '*'];
const ignoreToken = (text) => {
    if (text && text[0]) {
        for (const pre in ignore) {
            if (ignore[pre] === text[0]) {
                return true;
            }
        }
    } else {
        return true;
    }
    return false;
};

editor.textEditor.codeMirror.on("change", function (editor, change) {
    if (change.origin == "+input") {
        var text = change.text;
        if (!ignoreToken(text))
            setTimeout(function () { editor.execCommand("autocomplete"); }, 700);
    }
});

editor.addChangeListener(function (event) {
    // console.log('Change! Better save:', event.value);
    // lint custom ref: https://juejin.cn/post/7127282061211074573
});

function div_display(divId, show) {
    var div = document.getElementById(divId);

    if (div) {
        div.style.display = show ? 'block' : 'none';
    }
}

// set python code
/*
editor.setCode(`year = input()
year = int(year)
year = year - 1911
print(year)
`);
*/

class Main {

    init() {
        this.coms = {};
        // 改成所有元件ready再初始化,不要用 setTimeout
        setTimeout(function () {
            window.Main.editor = editor;
            window.flow = document.getElementById('flow');
            window.Main.registry("deploy_v1", document.getElementById('deploy_v1'));
            window.Main.registry("deploy_v2", document.getElementById('deploy_v2'));
            window.Main.registry("runPython", document.getElementById('runPython'));
        }, 100);
    }

    async select(url, sheetName, question) {
        var sheetTopic = '@sheet';
        var mqtt = this.coms['app'];
        var prompt = "sheet:" + url + " " + sheetName + " " + question;
        var data = await mqtt.publishTopic(sheetTopic, prompt);
        return data;
    }

    ready(name, obj) {
        console.log("Component Ready...", name);
        if (name == 'wa-range') {
            var range = obj;
            range.onSlider(function (value) {
                document.getElementsByClassName("CodeMirror")[0].style['font-size'] = value + 'px';
                editor.textEditor.codeMirror.refresh();
            });
        }
    }

    // mqtt,gpt,voice,deploy,carousel,flow
    registry(comName, obj) {
        this.coms[comName] = obj;
        console.log(" Registry >>> [" + comName + "]");
    }

    popup(title, text, icon, confirmButtonText) {
        return Swal.fire({
            title: title,
            html: text,
            icon: icon,
            confirmButtonText: confirmButtonText
        })
    }

    eventTrigger(com, action, info) {
        console.log(com, ":", action, ":", info);
        this.actor = info[1];
        this.coms['select_prompt'].renderActorSelect(this.actor);
        if (com == 'mqtt' && action == 'onFailure') {
            //alert('連線中斷，請重新整理網頁');
        }
        else if (com == 'carousel' && action == 'setActor') {
            this.coms['gpt'].clear();
            if (info[1] == 'python') {
                div_display('content-md', false);
                div_display('content-code', true);
                this.coms['deploy_v1'].hide(true);
                this.coms['deploy_v1'].setEnable(false);
                this.coms['deploy_v2'].hide(true);
                this.coms['deploy_v2'].setEnable(false);
                this.coms['runPython'].hide(false);
                this.coms['split-v'].setHideBody(false);
            }
            else if (info[1] == 'wbitv1') {
                div_display('content-md', false);
                div_display('content-code', true);
                this.coms['deploy_v1'].hide(false);
                this.coms['deploy_v1'].setEnable(true);
                this.coms['deploy_v2'].hide(true);
                this.coms['deploy_v2'].setEnable(false);
                this.coms['runPython'].hide(true);
                this.coms['split-v'].setHideBody(true);
            }
            else if (info[1] == 'wbit') {
                div_display('content-md', false);
                div_display('content-code', true);
                this.coms['deploy_v2'].hide(false);
                this.coms['deploy_v2'].setEnable(true);
                this.coms['deploy_v1'].hide(true);
                this.coms['deploy_v1'].setEnable(false);
                this.coms['runPython'].hide(true);
                this.coms['split-v'].setHideBody(true);
            }
            else if (info[1] == 'mbit') {
                div_display('content-md', false);
                div_display('content-code', true);
                this.coms['deploy_v1'].hide(true);
                this.coms['deploy_v1'].setEnable(false);
                this.coms['deploy_v2'].hide(true);
                this.coms['deploy_v2'].setEnable(false);
                this.coms['runPython'].hide(true);
                this.coms['split-v'].setHideBody(true);
            }
            else if (info[1] == 'gpt35') {
                div_display('content-md', true);
                div_display('content-code', false);
                this.coms['deploy_v1'].hide(true);
                this.coms['deploy_v1'].setEnable(false);
                this.coms['deploy_v2'].hide(true);
                this.coms['deploy_v2'].setEnable(false);
                this.coms['runPython'].hide(true);
                this.coms['split-v'].setHideBody(true);
            }
        }
    }
}

window.Main = new Main();
window.Main.init();
