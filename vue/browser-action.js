import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'vuetify/dist/vuetify.min.css';
import '@/filters/translate.js';

import Vue from 'vue';
import Vuetify from 'vuetify'
import BrowserAction from '@/BrowserAction.vue';
import FlagIcon from '@/components/FlagIcon.vue';
import StrengthIndicator from '@/components/StrengthIndicator.vue';
import Proxy from '@/components/Proxy.vue';
import ProxyList from '@/components/ProxyList.vue';
import Refresher from '@/components/Refresher.vue';
import FilterList from '@/components/FilterList.vue';
import Blacklist from '@/components/Blacklist.vue';
import BlacklistPattern from '@/components/BlacklistPattern.vue'

Vue.use(Vuetify, {
    theme: {
        primary: '#795548'
    }
});

Vue.component(FlagIcon.name, FlagIcon);
Vue.component(Proxy.name, Proxy);
Vue.component(StrengthIndicator.name, StrengthIndicator);
Vue.component(ProxyList.name, ProxyList);
Vue.component(Refresher.name, Refresher);
Vue.component(FilterList.name, FilterList);
Vue.component(Blacklist.name, Blacklist);
Vue.component(BlacklistPattern.name, BlacklistPattern);

new Vue({
    el: '#browser-action',
    render: h => h(BrowserAction)
});
