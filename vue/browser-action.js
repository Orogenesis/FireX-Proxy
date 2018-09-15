import Vue from 'vue';
import BrowserAction from './BrowserAction.vue';
import FlagIcon from './components/FlagIcon.vue';

Vue.component('flag-icon', FlagIcon);

new Vue({
    el: '#browser-action',
    render: h => h(BrowserAction)
});
