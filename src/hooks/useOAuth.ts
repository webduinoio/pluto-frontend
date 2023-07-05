export function useLoginUrl() {
    const url = new URL(`${import.meta.env.VITE_OAUTH_SERVER_HOST}/log-in`);
    url.searchParams.append('grant_type', 'authorization_code');
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', import.meta.env.VITE_OAUTH_CLIENT_ID);
    url.searchParams.append('redirect_uri', `${import.meta.env.VITE_SERVER_HOST}/api/v1/auth/callback`);

    return url.toString();
};
