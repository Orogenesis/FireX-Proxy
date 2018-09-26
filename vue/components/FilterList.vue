<template>
    <v-menu
            :close-on-content-click="false"
            :light="true"
            top
            left
            max-width="80%"
            min-width="80%">
        <v-btn slot="activator" icon :dark="true">
            <v-badge right color="primary darken-3">
                <span slot="badge" v-if="countFilters > 0">{{countFilters}}</span>
                <v-icon>filter_list</v-icon>
            </v-badge>
        </v-btn>
        <v-card>
            <v-container>
                <v-switch
                        :label="this.$options.filters.translate('favorites')"
                        v-model="favorites"
                        color="primary">
                </v-switch>
                <v-combobox
                        v-model="countryFilter"
                        :items="countries"
                        :label="this.$options.filters.translate('country')"
                        chips
                        clearable
                        deletable-chips
                        solo
                        multiple>
                </v-combobox>
                <v-combobox
                        v-model="protocolFilter"
                        :items="protocols"
                        :label="this.$options.filters.translate('protocol')"
                        chips
                        clearable
                        deletable-chips
                        solo
                        multiple>
                </v-combobox>
            </v-container>
        </v-card>
    </v-menu>
</template>

<script>
    import bus from '@/common/bus.js';
    import * as constants from '@/common/constants.js';
    import * as browser from 'webextension-polyfill';

    export default {
        name: 'FilterList',
        data() {
            return {
                countries: [],
                countryFilter: [],
                protocols: [],
                protocolFilter: [],
                favorites: true,
                polled: false
            }
        },
        watch: {
            countryFilter() {
                if (!this.polled) {
                    return;
                }

                this.updateFilters();
            },
            protocolFilter() {
                if (!this.polled) {
                    return;
                }

                this.updateFilters();
            },
            favorites() {
                if (!this.polled) {
                    return;
                }

                this.updateFilters();
            }
        },
        computed: {
            countFilters() {
                return Number(this.countryFilter.length > 0) + Number(this.protocolFilter.length !== this.protocols.length) + Number(this.favorites === false);
            }
        },
        methods: {
            onProxiesUpdated(newProxies) {
                let uniqueCountries = new Set(newProxies.map(proxy => proxy.country));
                let newProtocols    = [...new Set(newProxies.map(proxy => proxy.protocol))];

                // New protocols should be enabled in filters
                this.protocolFilter = this.protocolFilter.concat(newProtocols.filter(protocol => this.protocols.indexOf(protocol) < 0));
                this.countries      = [...uniqueCountries].sort();
                this.protocols      = newProtocols;
            },
            updateFilters() {
                this.save();

                bus.$emit(constants.FILTERS_UPDATED, {
                    countries: this.countryFilter,
                    protocols: this.protocolFilter,
                    favorites: this.favorites,
                });
            },
            onFiltersReset() {
                this.countryFilter = [];
                this.protocolFilter = this.protocols;
                this.favorites = true;
            },
            poll() {
                browser.runtime.sendMessage({
                    name: 'poll-state',
                }).then(state => {
                    const { filters } = state;
                    const { countryFilter, protocolFilter, favorites, protocols } = filters;

                    this.countryFilter = countryFilter;
                    this.protocolFilter = protocolFilter;
                    this.protocols = protocols;
                    this.favorites = favorites;
                    this.polled = true;
                });
            },
            save() {
                browser.runtime.sendMessage({
                    name: 'update-state',
                    message: {
                        filters: {
                            countryFilter: this.countryFilter,
                            protocolFilter: this.protocolFilter,
                            protocols: this.protocols,
                            favorites: this.favorites
                        }
                    }
                })
            }
        },
        mounted() {
            this.poll();

            bus.$on(constants.PROXY_UPDATE_FINISHED, this.onProxiesUpdated);
            bus.$on(constants.PROXY_UPDATE_FINISHED, this.updateFilters);
            bus.$on(constants.FILTERS_RESET, this.onFiltersReset);
        },
        beforeDestroy() {
            bus.$off(constants.PROXY_UPDATE_FINISHED, this.onProxiesUpdated);
            bus.$off(constants.PROXY_UPDATE_FINISHED, this.updateFilters);
            bus.$off(constants.FILTERS_RESET, this.onFiltersReset);
        }
    }
</script>
