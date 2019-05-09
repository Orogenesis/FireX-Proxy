import * as browser from 'webextension-polyfill'

const state = {
    servers: [],
    countries: []
};

const getters = {
    getActive(state) {
        return state.servers.find(({ activeState }) => activeState) || {};
    },
    isActivated(state, getters) {
        return Object.keys(getters.getActive).length > 0;
    }
};

const actions = {
    async updateCountries({ commit }) {
        const response = await fetch(`https://api.firexproxy.com/v1/country`);
        const data = await response.json();

        commit('updateCountries', data.map(({ name }) => name));
    },
    async updateServers({ commit }) {
        const response = await browser.runtime.sendMessage({ name: 'relevant' });

        if (response.length > 0) {
            commit('updateServers', response);
        }
    },
    connect({ commit }, server) {
        browser.runtime.sendMessage({ name: 'connect-premium', message: server });
        commit('activate', server);
    },
    disconnect({ commit }) {
        browser.runtime.sendMessage({ name: 'disconnect' });
        commit('disableAll');
    },
    next({ commit, dispatch, getters, state }, selectedCountry) {
        const finder = ({ country }) => country === selectedCountry;
        const servers = state.servers.filter(finder);

        dispatch('connect', servers[servers.length - 1]);
    }
};

const mutations = {
    updateCountries(state, countries) {
        state.countries = countries.sort((a, b) => a.localeCompare(b)).map(country => ({ country, count: 0 }));
    },
    updateServers(state, servers) {
        const reducer = (a, b) => ({ ...a, [b['country']]: ({ country: b['country'], count: ((a[b['country']] || {})['count'] || 0) + 1 }) });
        const comparator = ({ country: countryA }, { country: countryB }) => countryA.localeCompare(countryB);

        state.countries = Object.values(servers.reduce(reducer, {})).sort(comparator);
        state.servers = servers;
    },
    activate(state, server) {
        const finder = ({ ipAddress, port }) => server.ipAddress === ipAddress && server.port === port;
        const serverAt = state.servers.findIndex(finder);
        const newServer = { ...server, activeState: true };

        state.servers.splice(serverAt, 1);
        state.servers.unshift(newServer);
    },
    disableAll(state) {
        state.servers = state.servers.map(s => ({ ...s, activeState: false }));
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
