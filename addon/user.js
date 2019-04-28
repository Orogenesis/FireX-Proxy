function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
}

export class User {
    constructor(baseUrl = "https://api.firexproxy.com") {
        this.baseUrl = baseUrl;
        this.credentials = null;
    }

    init(credentials) {
        this.credentials = credentials;
    }

    read(credentials) {
        this.credentials = credentials ? JSON.parse(decodeURIComponent(credentials)) : credentials;

        browser.storage.local.set({
            credentials: this.credentials
        });
    }

    query() {
        if (this.credentials) {
            return Promise.resolve(this.credentials);
        }

        return browser.cookies
            .get({
                url: "https://www.firexproxy.com",
                name: "credentials"
            })
            .then(cookie => {
                if (cookie && cookie.value) {
                    this.read(cookie.value);
                    if (this.isExpired) {
                        this.credentials = null;
                    }
                }

                return this.credentials;
            });
    }

    refresh() {
        if (!this.isExpired) {
            return Promise.resolve();
        }

        let options = {
            method: 'post',
            credentials: 'include',
            headers: new Headers({
                "Authentication": `Bearer ${this.credentials.refreshToken}`
            })
        };

        return fetch(`${this.baseUrl}/auth/refresh`, options)
            .then(newCredentials => this.credentials = newCredentials)
            .catch(() => this.credentials = null)
    }

    get isExpired() {
        if (!this.credentials) {
            return true;
        }

        const { exp } = parseJwt(this.credentials.accessToken);

        return Math.floor((new Date().getTime()) / 1e3) >= exp;
    }

    get name() {
        if (!this.credentials) {
            return null;
        }

        const { aud } = parseJwt(this.credentials.accessToken);

        return aud;
    }

    get accessToken() {
        if (!this.credentials) {
            return null;
        }

        return this.credentials.accessToken;
    }
}
