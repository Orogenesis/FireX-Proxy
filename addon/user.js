export class User {
    constructor() {
        this.credentials = {};
        this.profile = {};
    }

    /**
     * @returns {Promise}
     */
    async parseCookies() {
        await this.refresh();

        if (!this.isEmpty()) {
            return this.metadata();
        }

        const data = { url: 'https://www.firexproxy.com', name: 'credentials' };
        const { value } = await browser.cookies.get(data) || {};

        if (!value) {
            return {};
        }

        this.updateCredentials(JSON.parse(decodeURIComponent(value)));

        return this.metadata();
    }

    /**
     * @param {Object} credentials
     * @returns {void}
     */
    updateCredentials(credentials = {}) {
        this.credentials = credentials;
        browser.storage.local.set({ credentials });
    }

    /**
     * @returns {void}
     */
    async refresh() {
        const { refreshToken } = this.credentials;

        if (!this.isExpired || this.isEmpty()) {
            return;
        }

        const options = {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({ Authorization: `Bearer ${refreshToken}` })
        };

        try {
            const response = await fetch('https://api.firexproxy.com/auth/refresh', options);
            const data = await response.json();
            const { access_token: accessToken, refresh_token: refreshToken } = data;
            const credentials = { accessToken, refreshToken };
            const cookies = { url: 'https://www.firexproxy.com', name: 'credentials', value: encodeURIComponent(JSON.stringify(credentials)) };

            browser.cookies.set(cookies);
            this.updateCredentials(credentials);
        } catch (e) {
            this.updateCredentials();
        }
    }

    /**
     * @returns {Promise}
     */
    async getProfile() {
        if (this.isExpired) {
            return {};
        }

        const { accessToken } = this.credentials;
        const options = {
            method: 'GET',
            credentials: 'include',
            headers: new Headers({ Authorization: `Bearer ${accessToken}` })
        };

        try {
            const response = await fetch(`https://api.firexproxy.com/auth/profile`, options);
            const { premium_expires_at: premiumExpiresAt } = await response.json();

            this.profile = { premiumExpiresAt };
        } catch (e) {
            this.profile = {};
        }

        return this.profile;
    }

    /**
     * @returns {boolean}
     */
    get isExpired() {
        const { exp } = this.metadata();

        return Math.floor((new Date().getTime()) / 1e3) >= (exp || 0);
    }

    /**
     * @returns {boolean}
     */
    isEmpty() {
        return Object.keys(this.credentials).length === 0;
    }

    /**
     * @returns {Object}
     */
    metadata() {
        if (this.isEmpty()) {
            return {};
        }

        const { accessToken } = this.credentials;
        const [, payload] = accessToken.split('.');

        return JSON.parse(atob(payload));
    }
}
