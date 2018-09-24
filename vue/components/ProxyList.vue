<template>
    <v-layout class="font-weight-medium caption" fill-height justify-center v-bind:class="{'align-center': filtered.length === 0 || !loaded}">
        <v-progress-circular
                indeterminate
                v-if="!loaded"
                color="primary">
        </v-progress-circular>
        <v-container grid-list-xs v-else-if="filtered.length > 0">
            <v-layout justify-center column>
                <proxy v-for="(proxy, index) in filtered"
                       :key="index"
                       v-bind="{ proxy: proxy }"
                       @proxyStateChanged="apply" />
            </v-layout>
        </v-container>
        <span class="body-2" v-else>
            {{ 'no_proxy' | translate }} <span class="reset-button primary--text" v-on:click="resetFilters">{{ 'reset_filters' | translate }}.</span>
        </span>
    </v-layout>
</template>

<script>
    import ProxyComponent from '@/components/Proxy.vue';
    import * as browser from 'webextension-polyfill';
    import bus from '@/common/bus.js';
    import * as constants from '@/common/constants.js';

    export default {
        name: 'ProxyList',
        components: {
            ProxyComponent
        },
        data() {
            return {
                proxies: [],
                loaded: false,
                filterConfig: {
                    countries: [],
                    protocols: [],
                    favorites: false,
                }
            }
        },
        methods: {
            getData(isForce = false) {
                this.loaded = false;

                browser.runtime.sendMessage({
                    name: 'get-proxies',
                    message: {
                        force: isForce
                    }
                }).then(proxies => {
                    this.proxies = proxies.map(proxy => Object.assign({}, proxy, {country: proxy.country || 'Unknown'}));
                    this.loaded = true;

                    bus.$emit(constants.PROXY_UPDATE_FINISHED, this.proxies);
                });
            },
            refresh() {
                this.getData(true);
            },
            apply(index, newState) {
                const current = this.proxies.findIndex(
                    proxy => proxy.ipAddress === this.filtered[index].ipAddress && proxy.port === this.filtered[index].port
                );

                this.proxies.forEach(
                    (proxy, i) => {
                        if (i === current) {
                            return;
                        }

                        proxy.activeState = false;
                    });

                browser.runtime.sendMessage({
                    name: newState ? 'connect' : 'disconnect',
                    message: this.filtered[index]
                })
            },
            filters(newFilterConfig) {
                this.filterConfig = newFilterConfig;
            },
            resetFilters() {
                bus.$emit(constants.FILTERS_RESET);
            }
        },
        computed: {
            filtered: {
                deep: true,
                get() {
                    return this.proxies.filter(proxy => {
                        const { protocols, countries, favorites } = this.filterConfig;

                        return protocols.indexOf(proxy.protocol) > -1 && (countries.length === 0 || countries.indexOf(proxy.country) > -1) && (favorites || !proxy.favoriteState);
                    });
                }
            }
        },
        mounted() {
            this.getData();

            bus.$on(constants.PROXY_UPDATE_EVENT, this.refresh);
            bus.$on(constants.FILTERS_UPDATED, this.filters);
        },
        beforeDestroy() {
            bus.$off(constants.PROXY_UPDATE_EVENT, this.refresh);
            bus.$off(constants.FILTERS_UPDATED, this.filters);
        }
    }
</script>

<style lang="scss" scoped>
    .reset-button {
        text-decoration-style: solid;
        cursor: pointer;
    }

    .container {
        padding: 0;
        margin: 0;
    }
</style>
