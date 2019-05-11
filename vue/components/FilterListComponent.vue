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
                <span slot="badge" v-if="countFilters > 0">{{ countFilters }}</span>
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
    import { mapState } from 'vuex'

    export default {
        name: 'FilterListComponent',
        data() {
            return {
                polled: false
            }
        },
        computed: {
            countFilters() {
                return Number(this.countryFilter.length > 0) + Number(this.protocolFilter.length !== this.protocols.length) + Number(this.favorites === false);
            },
            favorites: {
                get() {
                    return this.$store.state.filters.favorites;
                },
                set(newValue) {
                    this.$store.commit('filters/setFavoriteState', newValue);
                    this.updateFilters();
                }
            },
            protocolFilter: {
                get() {
                    return this.$store.state.filters.protocolFilter;
                },
                set(newValue) {
                    this.$store.commit('filters/setProtocolFilter', newValue);
                    this.updateFilters();
                }
            },
            countryFilter: {
                get() {
                    return this.$store.state.filters.countryFilter;
                },
                set(newValue) {
                    this.$store.commit('filters/setCountryFilter', newValue);
                    this.updateFilters();
                }
            },
            ...mapState('filters', {
                countries: 'countries',
                protocols: 'protocols'
            })
        },
        methods: {
            updateFilters() {
                if (!this.polled) {
                    return;
                }

                this.$store.dispatch('filters/save');
            }
        },
        mounted() {
            this.$store.dispatch('filters/update').then(() => this.polled = true);
        }
    }
</script>
