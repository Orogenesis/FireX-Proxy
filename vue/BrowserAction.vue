<template>
    <div id="wrapper">
        <md-toolbar class="md-transparent">
            <div class="md-toolbar-row">
                <div class="md-toolbar-section-start">
                    <h3 class="md-title">FireX Proxy</h3>
                </div>
                <div class="md-toolbar-section-end">
                    <filter-list></filter-list>
                    <refresher></refresher>
                </div>
            </div>
        </md-toolbar>
        <article id="primary-content">
            <proxy-list></proxy-list>
        </article>
    </div>
</template>

<script>
    import ProxyList from "@/components/ProxyList.vue";
    import Refresher from "@/components/Refresher.vue";
    import FilterList from "@/components/FilterList.vue";

    export default {
        name: 'popup',
        components: {
            FilterList,
            ProxyList,
            Refresher
        },
        data () {
            return {
                conflicts: []
            };
        }
    }
</script>

<style lang="scss">
    @import "scss/main.scss";

    #wrapper {
        height: 100%;
        #primary-content {
            display: flex;
            flex-direction: column;
        }
    }
</style>
