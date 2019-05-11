import '@fortawesome/fontawesome-free/css/all.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'vuetify/dist/vuetify.min.css'
import '@/filters/translate.js'

import Vue from 'vue'
import Vuetify from 'vuetify'
import BrowserAction from '@/BrowserAction.vue'
import store from '@/store'

Vue.use(Vuetify, {
    iconfont: 'fa',
    theme: {
        primary: '#554fe8'
    }
});

Vue.component('proxy-list-component', () => import('@/components/ProxyListComponent.vue'));
Vue.component('blacklist-component', () => import('@/components/BlacklistComponent.vue'));
Vue.component('premium-component', () => import('@/components/PremiumComponent.vue'));

new Vue({
    el: '#browser-action',
    store,
    render: h => h(BrowserAction)
});
