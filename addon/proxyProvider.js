import { Address } from './address.js'

export class ProxyProvider {
    /**
     * @param {User} user
     */
    constructor(user) {
        this.user = user;
    }

    /**
     * @returns {Promise<Address[]>}
     */
    getProxies() {
        return fetch('https://api.firexproxy.com/v1/proxy').then(response => response.json()).then(response => this.convert(response));
    }

    /**
     * @returns {Promise<Address[]>}
     */
    getRelevantProxies() {
        const { accessToken } = this.user.credentials;
        const options = {
            method: 'GET',
            headers: new Headers({ Authorization: `Bearer ${accessToken}` })
        };

        return fetch('https://api.firexproxy.com/v1/relevant', options)
            .then(response => response.json())
            .then(response => this.convert(response))
            .then(response => response.filter(a => a.getCountry()));
    }

    /**
     * @param {Array<Object>} data
     * @returns {Address[]}
     */
    convert(data) {
        return data.map(
            ({ server, port, iso_code: isoCode, country, protocol, ping_time_ms: pingTimeMs, username, password }) =>
                (new Address())
                    .setIPAddress(server)
                    .setPort(port)
                    .setIsoCode(isoCode)
                    .setCountry(country)
                    .setProtocol(protocol)
                    .setPingTimeMs(pingTimeMs)
                    .setUsername(username)
                    .setPassword(password)
        );
    }
}
