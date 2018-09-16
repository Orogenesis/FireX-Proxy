import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';
import '@/filters/translate.js';

import Vue from 'vue';
import BrowserAction from '@/BrowserAction.vue';
import FlagIcon from '@/components/FlagIcon.vue';
import StrengthIndicator from '@/components/StrengthIndicator.vue';
import Proxy from '@/components/Proxy.vue';
import ProxyList from '@/components/ProxyList.vue';
import Refresher from '@/components/Refresher.vue';
import FilterList from '@/components/FilterList.vue';

import {
    MdButton,
    MdContent,
    MdTabs,
    MdCheckbox,
    MdToolbar,
    MdIcon,
    MdBadge,
    MdMenu,
    MdSwitch
} from 'vue-material/dist/components'


Vue.use(MdButton);
Vue.use(MdContent);
Vue.use(MdCheckbox);
Vue.use(MdToolbar);
Vue.use(MdIcon);
Vue.use(MdBadge);
Vue.use(MdMenu);
Vue.use(MdSwitch);

Vue.component('flag-icon', FlagIcon);
Vue.component('proxy', Proxy);
Vue.component('strength-indicator', StrengthIndicator);
Vue.component('proxy-list', ProxyList);
Vue.component('refresher', Refresher);
Vue.component('filter-list', FilterList);


new Vue({
    el: '#browser-action',
    render: h => h(BrowserAction)
});
