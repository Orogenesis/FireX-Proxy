import * as browser from 'webextension-polyfill';

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
}

const state = {
    credentials: null
};

const getters = {
    name(state) {
        if (!state.credentials) {
            return null;
        }

        const { aud } = parseJwt(state.credentials.accessToken);
        return aud;
    },
    isExpired(state) {
        if (!state.credentials) {
            return true;
        }

        const { exp } = parseJwt(state.credentials.accessToken);
        return Math.floor((new Date().getTime()) / 1e3) >= exp;
    }
};

const actions = {
    update({ commit }) {
        return browser.runtime
            .sendMessage({ name: 'get-user' })
            .then(credentials => commit('setCredentials', credentials));
    }
};

const mutations = {
    setCredentials(state, credentials) {
        state.credentials = credentials;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
