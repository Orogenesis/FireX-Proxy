<template>
    <div id="wrapper">
        <header id="controls">
            <h4>Proxy List</h4>
            <div class="right-content">
                <refresher></refresher>
            </div>
        </header>
        <article id="primary-content">
            <proxy-list></proxy-list>
        </article>
    </div>
</template>

<script>
    import ProxyList from "./components/ProxyList.vue";
    import Refresher from "@/components/Refresher.vue";

    export default {
        name: 'popup',
        components: {
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
    @import "_reset.scss";

    .checkbox {
        width: 16px;
        height: 16px;
        display: inline-block;
        cursor: pointer;
        border: 1px solid #CCCCCC;
        border-radius: 2px;
        margin-right: 8px;
        vertical-align: -4px;
        background-image: url(~@/icons/checked.svg);
        background-size: 10px 10px;
        background-repeat: no-repeat;
        background-color: #D9D9D9;
        background-position: center center;
        &.active {
            background-color: #78C0BD;
            border-color: $primaryColor;
        }
    }

    #wrapper {
        height: 100%;
        #primary-content {
            display: flex;
            flex-direction: column;
        }
        #controls {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 10px;
            h4 {
                color: $materialBlack;
            }
            .right-content {
                margin-left: auto;
            }
        }
    }
</style>
