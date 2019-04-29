<template>
    <v-card height="100%">
        <v-card dark flat>
            <v-img :src="require('@/assets/material.png')" gradient="to top, rgba(190, 136, 233, .88), rgba(253, 138, 166, .88)">
                <v-container fill-height>
                    <v-layout align-center>
                        <strong class="mr-3 display-4 font-weight-regular">
                            {{ premiumDays }}
                        </strong>
                        <v-layout column justify-end>
                            <div class="headline text-lowercase font-weight-light">{{ 'premium' | translate }}</div>
                            <div class="text-uppercase font-weight-light">{{ 'days_left' | translate }}</div>
                        </v-layout>
                    </v-layout>
                </v-container>
            </v-img>
        </v-card>
        <v-card-text>
            <v-toolbar dense class="mb-2">
                <v-overflow-btn
                        v-model="selectedCountry"
                        :items="countries"
                        :label="this.$options.filters.translate('country')"
                        :no-data-text="'No countries available'"
                        editable
                        hide-details
                        item-text="country"
                        item-value="country"
                        class="pa-0"
                        overflow>
                    <template slot="item" slot-scope="data">
                        {{ data.item.country }}
                        <v-spacer></v-spacer>
                        <span v-if="data.item.count > 0" class="pink--text">
                            {{ data.item.count }}
                        </span>
                    </template>
                </v-overflow-btn>
                <v-divider vertical class="mr-2"></v-divider>
                <v-flex xs3>
                    <v-btn flat v-if="isActivated" color="error" :disabled="!isPremium" @click="off">{{ 'off' | translate }}</v-btn>
                    <v-btn flat v-else color="primary lighten-1" :disabled="!isPremium" @click="apply">{{ 'on' | translate }}</v-btn>
                </v-flex>
                <v-flex xs1>
                    <v-tooltip bottom>
                        <v-btn slot="activator" v-on="on" flat icon color="success" :disabled="!isPremium" @click="apply">
                            <v-icon>refresh</v-icon>
                        </v-btn>
                        <span>{{ 'refresh_tooltip' | translate }}</span>
                    </v-tooltip>
                </v-flex>
            </v-toolbar>
            <v-card class="px-3">
                <v-layout align-center>
                    <v-flex xs7>
                        <v-list>
                            <v-list-tile>
                                <v-list-tile-action>
                                    <v-icon color="pink">done_all</v-icon>
                                </v-list-tile-action>
                                <v-list-tile-content>
                                    <v-list-tile-title class="caption">{{ 'pros_alive' | translate }}</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                            <v-list-tile class="pa-0">
                                <v-list-tile-action>
                                    <v-icon color="pink">done_all</v-icon>
                                </v-list-tile-action>
                                <v-list-tile-content>
                                    <v-list-tile-title class="caption">{{ 'pros_fast_servers' | translate }}</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                            <v-list-tile class="pa-0">
                                <v-list-tile-action>
                                    <v-icon color="pink">done_all</v-icon>
                                </v-list-tile-action>
                                <v-list-tile-content>
                                    <v-list-tile-title class="caption">{{ 'pros_bandwidth' | translate }}</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </v-list>
                    </v-flex>
                    <v-divider vertical></v-divider>
                    <v-flex xs5 class="ml-2">
                        <v-layout column justify-center>
                            <v-dialog v-model="dialog">
                                <v-btn outline slot="activator" class="ma-0" color="primary" v-on="on" v-if="isExpired">{{ 'sign_in' | translate }}</v-btn>
                                <v-btn outline slot="activator" class="ma-0" color="primary" v-on="on" v-else>{{ 'change_user' | translate }}</v-btn>
                                <v-card>
                                    <v-card-title class="headline justify-center">{{ 'authentication' | translate }}</v-card-title>
                                    <v-card-text>
                                        <v-layout justify-center row wrap>
                                            <v-btn @click="authenticate('google')" fab dark color="red">
                                                <v-icon dark>fab fa-google</v-icon>
                                            </v-btn>
                                            <v-btn @click="authenticate('vk')" fab dark color="blue darken-3">
                                                <v-icon dark>fab fa-vk</v-icon>
                                            </v-btn>
                                            <v-btn @click="authenticate('facebook')" fab dark color="indigo darken-1">
                                                <v-icon dark>fab fa-facebook</v-icon>
                                            </v-btn>
                                            <v-btn @click="authenticate('yandex')" fab dark color="yellow darken-2">
                                                <v-icon dark>fab fa-yandex</v-icon>
                                            </v-btn>
                                        </v-layout>
                                    </v-card-text>
                                    <v-card-actions class="justify-center">
                                        <v-btn flat color="blue darken-2" @click="dialog = false">
                                            {{ 'close' | translate }}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                            <v-btn @click="checkout" class="ma-0 mt-2" color="success" dark>
                                {{ 'get_premium' | translate }}
                            </v-btn>
                        </v-layout>
                    </v-flex>
                </v-layout>
            </v-card>
        </v-card-text>
    </v-card>
</template>

<script>
    import * as browser from 'webextension-polyfill'
    import { mapState, mapGetters } from 'vuex'

    export default {
        name: 'PremiumComponent',
        data: () => ({
            dialog: false,
            selectedCountry: null
        }),
        computed: {
            ...mapState('user', {
                name: 'aud'
            }),
            ...mapGetters('user', [
                'isExpired',
                'isPremium',
                'premiumDays'
            ]),
            ...mapGetters('premium', [
                'getActive',
                'isActivated'
            ]),
            ...mapState('premium', {
                countries: state => state.countries,
                servers: state => state.servers,
                state: state => state.enabled
            })
        },
        methods: {
            authenticate(provider) {
                this.$store.dispatch('user/authenticate', provider).then(url => browser.tabs.create({ url }));
            },
            checkout() {
                browser.tabs.create({ url: 'https://www.firexproxy.com/checkout' });
            },
            apply() {
                if (!this.selectedCountry) {
                    return;
                }

                this.$store.commit('proxies/disableAll');
                this.$store.dispatch('premium/next', this.selectedCountry);
            },
            off() {
                this.$store.dispatch('premium/disconnect');
            }
        },
        async mounted() {
            this.$store.dispatch('premium/updateCountries');
            this.$store.dispatch('user/profile');
            await this.$store.dispatch('premium/updateServers');

            this.selectedCountry = this.getActive.country;
        }
    }
</script>

<style lang="scss" scoped>
    /deep/ .v-list__tile {
        padding: 0;
        .v-list__tile__action {
            min-width: 34px;
        }
    }

    /deep/ .v-dialog__activator {
        .v-btn {
            width: 100%;
        }
    }
</style>
