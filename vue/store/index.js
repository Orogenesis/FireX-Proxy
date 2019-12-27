import Vue from 'vue'
import Vuex from 'vuex'

import proxies from './modules/proxies'
import patterns from './modules/patterns'
import filters from './modules/filters'
import user from './modules/user'
import premium from './modules/premium'

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    proxies,
    filters,
    patterns,
    user,
    premium
  }
})
