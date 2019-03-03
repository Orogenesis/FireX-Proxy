import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'vuetify/dist/vuetify.min.css';
import '@/filters/translate.js';

import Vue from 'vue';
import Vuetify from 'vuetify'
import BrowserAction from '@/BrowserAction.vue';
import store from '@/store';

Vue.use(Vuetify, {
    theme: {
        primary: '#554fe8'
    }
});

Vue.component('proxy-list-component', () => import('@/components/ProxyListComponent.vue'));
Vue.component('blacklist-component', () => import('@/components/BlacklistComponent.vue'));
Vue.component('add-proxy-component', () => import('@/components/AddProxyComponent.vue'));
Vue.component('filter-list-component', () => import('@/components/FilterListComponent.vue'));
Vue.component('refresher-component', () => import('@/components/RefresherComponent.vue'));
Vue.component('flag-icon-component', () => import('@/components/FlagIconComponent.vue'));

new Vue({
    el: '#browser-action',
    store,
    render: h => h(BrowserAction)
});
