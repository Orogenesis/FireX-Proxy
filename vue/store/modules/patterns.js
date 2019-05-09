import * as browser from 'webextension-polyfill'

const state = {
    isBlacklistEnabled: false,
    patterns: []
};

const actions = {
    save({ state }) {
        browser.storage.local.set({
            isBlacklistEnabled: state.isBlacklistEnabled,
            patterns: state.patterns
        });
    },
    remove({ commit, dispatch, state }, index) {
        commit('removePattern', index);

        if (state.patterns.length === 0) {
            commit('setBlacklistEnabled', false);
        }

        dispatch('save');
    },
    poll({ commit }) {
        return browser.storage.local.get().then(storage => {
            commit('setBlacklistEnabled', storage.isBlacklistEnabled || false);
            commit('setPatterns', storage.patterns || []);
        });
    }
};

const mutations = {
    removePattern(state, index) {
        state.patterns.splice(index, 1);
    },
    addPattern(state, pattern) {
        state.patterns.push(pattern);
    },
    setPatterns(state, patterns) {
        state.patterns = patterns;
    },
    setBlacklistEnabled(state, isBlacklistEnabled) {
        state.isBlacklistEnabled = isBlacklistEnabled;
    }
};

export default {
    namespaced: true,
    state,
    actions,
    mutations
};
