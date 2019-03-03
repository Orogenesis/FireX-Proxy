<template>
    <v-layout class="font-weight-bold caption" fill-height justify-center v-bind:class="{'align-center': filtered.length === 0 || !loaded}">
        <v-progress-circular
                indeterminate
                v-if="!loaded"
                color="primary">
        </v-progress-circular>
        <v-container grid-list-xs v-else-if="filtered.length > 0">
            <v-layout justify-center column>
                <virtual-list :size="50" :remain="11" :bench="20" class="virtual-list">
                    <proxy-component v-for="(proxy, index) in filtered"
                           :key="index"
                           v-bind="{ proxy: proxy }" @proxyStateChanged="apply">
                    </proxy-component>
                </virtual-list>
            </v-layout>
        </v-container>
        <span class="body-2" v-else>
            {{ 'no_proxy' | translate }} <span class="reset-button primary--text" v-on:click="resetFilters">{{ 'reset_filters' | translate }}.</span>
        </span>
    </v-layout>
</template>

<script>
    import ProxyComponent from '@/components/ProxyComponent.vue'
    import * as browser from 'webextension-polyfill'
    import bus from '@/common/bus.js'
    import * as constants from '@/common/constants.js'
    import { mapState } from 'vuex'
    import virtualList from 'vue-virtual-scroll-list'

    export default {
        name: 'ProxyListComponent',
        components: {
            ProxyComponent,
            virtualList
        },
        methods: {
            apply(index, newState) {
                const current = this.proxies.findIndex(
                    proxy => proxy.ipAddress === this.filtered[index].ipAddress && proxy.port === this.filtered[index].port
                );

                this.proxies.forEach((proxy, i) => {
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
            resetFilters() {
                this.$store.commit('filters/resetFilters');
                this.$store.dispatch('filters/save');
            }
        },
        computed: {
            filtered: {
                deep: true,
                get() {
                    return this.proxies.filter(proxy => {
                        const { protocols, countries, favorites } = this;

                        return protocols.indexOf(proxy.protocol) > -1 && (countries.length === 0 || countries.indexOf(proxy.country) > -1) && (favorites || !proxy.favoriteState);
                    });
                }
            },
            ...mapState({
                loaded: state => state.proxies.loaded,
                proxies: state => state.proxies.items
            }),
            ...mapState('filters', {
                favorites: 'favorites',
                protocols: 'protocolFilter',
                countries: 'countryFilter'
            })
        },
        mounted() {
            this.$store.dispatch('poll').then(() => bus.$emit(constants.PROXY_UPDATE_FINISHED));
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
        .layout {
            height: 100%;
            .virtual-list {
                height: 100%;
                overflow-x: hidden;
                overflow-y: auto;
            }
        }
    }
</style>
