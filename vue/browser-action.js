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

new Vue({
    el: '#browser-action',
    store,
    render: h => h(BrowserAction)
});
