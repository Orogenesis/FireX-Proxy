<template>
    <section id="proxy-content">
        <div class="content-wrapper">
            <spinner v-if="!loaded" />
            <div id="proxy-list-box" v-else-if="proxies.length > 0">
                <proxy v-for="(proxy, index) in proxies"
                       :key="index"
                       v-bind="{ proxy: proxy }"
                       @proxyStateChanged="onProxyStateChanged">
                </proxy>
            </div>
            <div id="no-proxy-list" v-else>
                {{ 'no_proxy' | translate }} <span class="reset-button">{{ 'reset_filters' | translate }}</span>
            </div>
        </div>
    </section>
</template>

<script>
    import ProxyComponent from '@/components/Proxy.vue';
    import * as browser from 'webextension-polyfill';
    import Spinner from "@/components/Spinner.vue";
    import bus from '@/common/bus.js';
    import * as constants from '@/common/constants.js';

    export default {
        name: 'proxy-list',
        components: {
            Spinner,
            ProxyComponent
        },
        data() {
            return {
                proxies: [],
                loaded: false
            };
        },
        methods: {
            getData(isForce = false) {
                this.loaded = false;

                browser.runtime.sendMessage({
                    name: 'get-proxies',
                    force: isForce
                }).then(proxies => {
                    this.proxies = proxies;
                    this.loaded = true;
                });
            },
            onProxyUpdateHandler() {
                this.getData(true);
            }
        },
        mounted() {
            this.getData();

            bus.$on(constants.PROXY_UPDATE_EVENT, this.onProxyUpdateHandler);
        },
        beforeDestroy() {
            bus.$off(constants.PROXY_UPDATE_EVENT, this.onProxyUpdateHandler);
        }
    }
</script>

<style lang="scss">
    #proxy-content {
        .content-wrapper {
            position: relative;
            overflow-y: auto;
            overflow-x: hidden;
            #proxy-list-box {
                width: 100%;
                font-size: 12px;
                border-collapse: collapse;
                border-spacing: 0;
            }
            #no-proxy-list {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                margin: auto;
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                width: 200px;
                height: 20px;
                text-align: center;
                font-size: 14px;
                .reset-button {
                    color: $primaryColor;
                    text-decoration-style: solid;
                    cursor: pointer;
                }
            }
        }
    }
</style>
