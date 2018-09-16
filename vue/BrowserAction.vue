<template>
    <article id="wrapper">
        <article id="primary-content">
            <proxy-list></proxy-list>
        </article>
        <footer-component>

        </footer-component>
    </article>
</template>

<script>
    import ProxyList from "./components/ProxyList.vue";
    import FooterComponent from "@/components/Footer.vue";

    export default {
        name: 'popup',
        components: {
            ProxyList,
            FooterComponent
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
        display: flex;
        flex-direction: column;
        #primary-content {
            flex: 1;
        }
        footer-component {
            display: flex;
        }
    }
</style>