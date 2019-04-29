import Vue from 'vue'
import Vuex from 'vuex'
import proxies from '@/store/modules/proxies';
import patterns from '@/store/modules/patterns';
import filters from "@/store/modules/filters";
import user from "@/store/modules/user"
import premium from "@/store/modules/premium"

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
