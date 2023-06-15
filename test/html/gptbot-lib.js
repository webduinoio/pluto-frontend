class Cookie {
    constructor(months) {
        this.expires = new Date();
        this.expires.setMonth(this.expires.getMonth() + months);
    }

    set(key, value) {
        document.cookie = `${key}=${value};expires=${this.expires.toUTCString()}`;
    }

    get(key) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(key + '=')) {
                return cookie.substring(key.length + 1);
            }
        }
        return '';
    }
}


function isUrlEncoded(str) {
    try {
        decodeURIComponent(str);
        return true;
    } catch (e) {
        return false;
    }
}

function parseURL(str) {
    if (str.indexOf('#') < 0 || str.indexOf('#?') > 0) {
        str = cookie.get('userId');
        //str = str == '' ? '' : str;
        if (str == '') {
            parent.Main.popup(
                "還差一步!",
                "填寫表單就能申請體驗囉! <a href='https://webduino.pse.is/gpt_er'>我要申請</a>",
                "info", "知道了")
            return;
        }
        if (parent.location.href.indexOf('?') > 0) {
            var data = parent.location.href.split('?');
            parent.location.href = data[0] + '#' + str + '?' + data[1];
        }
    }
    var result = { 'prompt': '', 'actor': 'python' };
    var userId = '';
    var hashIndex = str.indexOf('#');
    var questionIndex = str.indexOf('?');

    if (hashIndex !== -1) {
        if (questionIndex !== -1) {
            userId = str.slice(hashIndex + 1, questionIndex);
        } else {
            userId = str.slice(hashIndex + 1);
        }
        cookie.set('userId', userId);
    } else {
        if (questionIndex !== -1) {
            userId = '';
        } else {
            userId = str;
        }
    }

    result.userId = userId == '' ? '' : userId;
    if (questionIndex !== -1) {
        var params = str.slice(questionIndex + 1).split('&');
        for (var i = 0; i < params.length; i++) {
            var parts = params[i].split('=');
            result[parts[0]] = decodeURIComponent(parts[1].replace(/\+/g, ' '));
        }
    }
    return result;
}


function debug(msg1, msg2) {
    var msg = msg1 + (!msg2 ? " " : " " + msg2);
    console.log(msg);
}
