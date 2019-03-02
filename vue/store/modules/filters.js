import * as browser from 'webextension-polyfill';

const state = {
    countries: [],
    protocols: [],
    countryFilter: [],
    protocolFilter: [],
    favorites: true
};

const actions = {
    updateChoices({ commit, state }, newProxies) {
        const uniqueCountries = new Set(newProxies.map(proxy => proxy.country));
        const allProtocols    = [...new Set(newProxies.map(proxy => proxy.protocol))];
        const newProtocols    = allProtocols.filter(protocol => state.protocols.indexOf(protocol) < 0);

        const update = {
            protocolFilter: state.protocolFilter.concat(newProtocols).filter(protocol => allProtocols.indexOf(protocol) >= 0),
            countries:      [...uniqueCountries].sort(),
            protocols:      allProtocols
        };

        commit('updateChoices', update);
    },
    update({ commit }) {
        return browser.runtime
            .sendMessage({ name: 'poll-state' })
            .then(({ filters }) => commit('update', filters));
    },
    save({ state }) {
        browser.runtime.sendMessage({
            name: 'update-state',
            message: { filters: state }
        })
    }
};

const mutations = {
    resetFilters(state) {
        state.countryFilter = [];
        state.protocolFilter = state.protocols;
        state.favorites = true;
    },
    updateChoices(state, { protocolFilter, countries, protocols }) {
        state.protocols = protocols;
        state.countries = countries;
        state.protocolFilter = protocolFilter;
    },
    update(state, inbound) {
        state = Object.assign(state, inbound);
    },
    setFavoriteState(state, favoriteState) {
        state.favorites = favoriteState;
    },
    setCountryFilter(state, countryFilter) {
        state.countryFilter = countryFilter;
    },
    setProtocolFilter(state, protocolFilter) {
        state.protocolFilter = protocolFilter;
    }
};

export default {
    namespaced: true,
    state,
    actions,
    mutations
};
