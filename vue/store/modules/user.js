import * as browser from 'webextension-polyfill'

const state = {
    credentials: {},
    profile: {}
};

const getters = {
    isExpired(state) {
        return Math.floor((new Date().getTime()) / 1e3) >= (state.credentials.exp || 0);
    },
    isPremium(state) {
        const { premiumExpiresAt } = state.profile;

        return premiumExpiresAt && (new Date().getTime() < new Date(premiumExpiresAt).getTime());
    },
    premiumDays() {
        const { premiumExpiresAt } = state.profile;

        if (!premiumExpiresAt) {
            return 0;
        }

        const delta = new Date(premiumExpiresAt).getTime() - new Date().getTime();

        return Math.ceil(delta / (1e3 * 60 * 60 * 24));
    }
};

const actions = {
    update({ commit }) {
        return browser.runtime.sendMessage({ name: 'get-user' }).then(credentials => commit('setCredentials', credentials));
    },
    authenticate({ commit }, provider) {
        return fetch(`https://api.firexproxy.com/auth/${provider}`).then(response => response.text());
    },
    profile({ commit }) {
        return browser.runtime.sendMessage({ name: 'get-profile' }).then(profile => commit('setProfile', profile));
    }
};

const mutations = {
    setCredentials(state, credentials) {
        state.credentials = credentials;
    },
    setProfile(state, profile) {
        state.profile = profile
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
