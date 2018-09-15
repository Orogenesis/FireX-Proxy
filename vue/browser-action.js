import Vue from 'vue';
import FlagIcon from 'vue-flag-icon-2'
import BrowserAction from './BrowserAction.vue';

Vue.use(FlagIcon);

new Vue({
    el: '#browser-action',
    render: h => h(BrowserAction)
});
