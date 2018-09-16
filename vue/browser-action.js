import Vue from 'vue';
import BrowserAction from '@/BrowserAction.vue';
import FlagIcon from '@/components/FlagIcon.vue';
import StrengthIndicator from '@/components/StrengthIndicator.vue';
import Proxy from '@/components/Proxy.vue'

Vue.component('flag-icon', FlagIcon);
Vue.component('proxy', Proxy);
Vue.component('strength-indicator', StrengthIndicator);

new Vue({
    el: '#browser-action',
    render: h => h(BrowserAction)
});
