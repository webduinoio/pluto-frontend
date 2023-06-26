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

function randomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function parseURL(str) {
    var result = { 'prompt': '', 'actor': 'python' };
    var userId = randomString(10);
    cookie.set('userId', userId);
    var questionIndex = str.indexOf('?');

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
