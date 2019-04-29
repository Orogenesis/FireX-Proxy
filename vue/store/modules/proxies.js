import * as browser from 'webextension-polyfill'

const defaultForm = {
    protocol: "HTTP",
    ipAddress: '',
    port: '',
    username: '',
    password: ''
};

const state = {
    items: [],
    loaded: false,
    createForm: defaultForm
};

const actions = {
    setLoaded({ commit }, loadedState) {
        commit('setLoaded', loadedState);
    },
    setProxies({ commit }, proxies) {
        commit('setProxies', proxies);
    },
    poll({ commit }, isForce = false) {
        commit('setLoaded', false);

        const message = {
            name: 'get-proxies',
            message: {
                force: isForce
            }
        };

        return browser.runtime
            .sendMessage(message)
            .then(proxies => {
                const newProxies = proxies.map(proxy => Object.assign({}, proxy, { country: proxy.country || 'Unknown' }));

                commit('setProxies', newProxies);
                commit('setLoaded', true);

                return proxies;
            });
    },
    addProxy({ commit }, proxy) {
        return browser.runtime.sendMessage({ name: 'add-proxy', message: proxy }).then(proxy => commit('addProxy', proxy));
    },
    modifyForm({ commit, dispatch }, payload) {
        commit('modifyForm', payload);
        dispatch('saveForm');
    },
    saveForm({ state }) {
        browser.runtime.sendMessage({
            name: 'update-state',
            message: { createForm: state.createForm }
        })
    },
    updateForm({ commit }) {
        return browser.runtime
            .sendMessage({ name: 'poll-state' })
            .then(({ createForm }) => commit('updateForm', createForm || defaultForm));
    },
    resetForm({ commit, dispatch }) {
        commit('updateForm', defaultForm);
        dispatch('saveForm');
    }
};

const mutations = {
    setLoaded(state, loadedState) {
        state.loaded = loadedState;
    },
    setProxies(state, proxies) {
        state.items = proxies;
    },
    addProxy(state, proxy) {
        state.items.unshift(proxy);
    },
    modifyForm(state, { field, value }) {
        state.createForm[field] = value;
    },
    updateForm(state, form) {
        state.createForm = Object.assign({}, form);
    },
    disableAll(state) {
        state.items = state.items.map(s => ({ ...s, activeState: false }));
    }
};

export default {
    state,
    actions,
    mutations
}
