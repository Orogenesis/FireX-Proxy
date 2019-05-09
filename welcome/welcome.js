import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'vuetify/dist/vuetify.min.css'

import Vue from 'vue'
import Vuetify from 'vuetify'
import App from '@welcome/App.vue'

Vue.use(Vuetify, {
    theme: {
        primary: '#554fe8'
    }
});

new Vue({
    el: '#welcome',
    render: h => h(App)
});
