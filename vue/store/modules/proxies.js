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
    async poll({ commit }, isForce = false) {
        commit('setLoaded', false);

        const message = { name: 'get-proxies', message: { force: isForce } };
        const proxies = await browser.runtime.sendMessage(message);
        const newProxies = proxies.map(proxy => ({ ...proxy, country: proxy.country || 'Unknown' }));

        this.dispatch('filters/updateChoices', newProxies);

        commit('setProxies', newProxies);
        commit('setLoaded', true);

        return proxies;
    },
    async connect({ commit, state }, proxy) {
        commit('disableAll');
        commit('activate', proxy);
        browser.runtime.sendMessage({ name: 'connect', message: proxy });
    },
    disconnect({ commit }) {
        commit('disableAll');
        browser.runtime.sendMessage({ name: 'disconnect' });
    },
    toggleFavorite({ commit }, proxy) {
        commit('toggleFavorite', proxy);
        browser.runtime.sendMessage({ name: 'toggle-favorite', message: proxy });
    },
    addProxy({ commit }, proxy) {
        browser.runtime.sendMessage({ name: 'add-proxy', message: proxy }).then(proxy => commit('addProxy', proxy));
    },
    modifyForm({ commit, dispatch }, payload) {
        commit('modifyForm', payload);
        dispatch('saveForm');
    },
    saveForm({ state }) {
        browser.runtime.sendMessage({ name: 'update-state', message: { createForm: state.createForm } })
    },
    updateForm({ commit }) {
        browser.runtime.sendMessage({ name: 'poll-state' }).then(({ createForm }) => commit('updateForm', createForm || defaultForm));
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
    },
    activate(state, proxy) {
        const finder = ({ ipAddress, port }) => proxy.ipAddress === ipAddress && proxy.port === port;

        state.items.splice(state.items.findIndex(finder), 1, { ...proxy, activeState: true });
    },
    toggleFavorite(state, proxy) {
        const finder = ({ ipAddress, port }) => proxy.ipAddress === ipAddress && proxy.port === port;

        state.items.splice(state.items.findIndex(finder), 1, { ...proxy, favoriteState: proxy.favoriteState === false });
    }
};

export default {
    namespaced: true,
    state,
    actions,
    mutations
}
