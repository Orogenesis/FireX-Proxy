import Vue from 'vue';
import BrowserAction from '@/BrowserAction.vue';
import FlagIcon from '@/components/FlagIcon.vue';
import StrengthIndicator from '@/components/StrengthIndicator.vue';
import Proxy from '@/components/Proxy.vue';
import Spinner from '@/components/Spinner.vue';
import ProxyList from '@/components/ProxyList.vue';
import FooterComponent from "@/components/Footer.vue";

import './filters/translate.js';

Vue.component('flag-icon', FlagIcon);
Vue.component('proxy', Proxy);
Vue.component('strength-indicator', StrengthIndicator);
Vue.component('spinner', Spinner);
Vue.component('proxy-list', ProxyList);
Vue.component('footer-component', FooterComponent);


new Vue({
    el: '#browser-action',
    render: h => h(BrowserAction)
});
