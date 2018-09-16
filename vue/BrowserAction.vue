<template>
    <div>
        <proxy v-for="proxy in proxies"
               :key="proxy.ip+';'+proxy.port"
               v-bind="{ proxy: proxy }">

        </proxy>
    </div>
</template>

<script>
    import ProxyComponent from '@/components/Proxy.vue';
    import * as browser from 'webextension-polyfill';

    export default {
        name: 'popup',
        components: {
            ProxyComponent
        },

        data () {
            return {
                proxies: [],
                conflicts: []
            };
        },

        methods: {
            getData() {
                browser
                    .runtime
                    .sendMessage({
                        name: 'show'
                    }).then(message => {
                        const { proxies, conflicts } = message;

                        this.proxies = proxies;
                        this.conflicts = conflicts;
                    });
            },
        },

        mounted() {
            this.getData();
        }
    }
</script>

<style lang="scss">
    @import "_reset.scss";
    $flag-icon-css-path: '~flag-icon-css/flags';
    @import "~flag-icon-css/sass/flag-icon.scss";
</style>