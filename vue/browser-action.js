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

Vue.component(FlagIcon.name, FlagIcon);
Vue.component(Proxy.name, Proxy);
Vue.component(StrengthIndicator.name, StrengthIndicator);
Vue.component(ProxyList.name, ProxyList);
Vue.component(Refresher.name, Refresher);
Vue.component(FilterList.name, FilterList);


new Vue({
    el: '#browser-action',
    render: h => h(BrowserAction)
});
