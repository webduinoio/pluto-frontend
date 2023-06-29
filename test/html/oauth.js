const baseUrl = "https://account-staging.webduino.io";
const oauthClientID = "thlp6rstwsl4iqa4";

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const setCookies = (key, value) => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    document.cookie = `${key}=${value};expires=${date.toUTCString()}`;
}

const isLogin = async () => {
    try {
        const requestOptions = {
            method: 'GET',
            redirect: 'follow',
            credentials: 'include'
        };

        const url = new URL(`${baseUrl}/api/v1/auth/is-login`);
        url.searchParams.append("token", getCookie("oauth_access_token"));

        const response = await fetch(url.toString(), requestOptions);
        const data = await response.json();
        return !!data?.data?.isLogin;
    } catch (error) {
        console.error(`[ERROR] isLogin: ${error}`)
        return false;
    }
}

const logout = () => {
    // https://account-staging.webduino.io/zh-TW/log-in?grant_type=authorization_code&response_type=code&client_id=thlp6rstwsl4iqa4&redirect_uri=http://localhost.webduino.io:8080/api/v1/auth/callback
    const locale = getCookie("NEXT_LOCALE") || "";
    const url = new URL(`${baseUrl}${locale ? `/${locale}` : ""}/log-in`);
    url.searchParams.append("grant_type", "authorization_code");
    url.searchParams.append("response_type", "code");
    url.searchParams.append("client_id", oauthClientID);
    url.searchParams.append("redirect_uri", `https://chat-staging.webduino.io/api/v1/auth/callback`);

    parent.location.href = url.toString();
}

const getUser = async () => {
    const requestOptions = {
        method: 'GET',
        credentials: 'include'
    };

    const url = new URL(`${baseUrl}/api/v1/user/`);

    const response = await fetch(url.toString(), requestOptions);
    const data = await response.json();
    return data?.data;
}