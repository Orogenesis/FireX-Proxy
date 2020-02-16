import * as browser from 'webextension-polyfill'

const state = {
  rated: false
};

const actions = {
  async getRated({ commit }) {
    const { rated } = await browser.runtime.sendMessage({ name: 'poll-state' });
    commit('updateRated', rated);
  },
  async updateRated({ commit }, rate) {
    const { rated } = await browser.runtime.sendMessage({ name: 'update-state', message: { rated: rate } });
    commit('updateRated', rated);
  }
};

const mutations = {
  updateRated(state, rated) {
    state.rated = rated;
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
