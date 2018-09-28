<template>
    <v-flex xs12>
        <v-layout row align-center v-bind:class="{ 'primary lighten-4': proxy.activeState }">
            <v-flex xs2>
                <v-btn icon flat v-on:click="toggleFavorite" :color="proxy.favoriteState ? 'red' : 'black'">
                    <v-icon small>thumb_up</v-icon>
                </v-btn>
            </v-flex>
            <v-flex xs1>
                <flag-icon class="flag-icon-circle" v-bind="{ iso: proxy.isoCode }" />
            </v-flex>
            <v-flex class="text-truncate" xs5>
                {{ proxy.country }}
            </v-flex>
            <v-flex xs1>
                <strength-indicator v-bind="{ strength: proxy.pingTimeMs, strengths: [300, 1000, 3000] }"></strength-indicator>
            </v-flex>
            <v-flex xs2>
                {{ proxy.protocol }}
            </v-flex>
            <v-flex xs3>
                <v-btn small v-if="!proxy.activeState" color="primary lighten-1" dark v-on:click="apply">{{ 'on' | translate }}</v-btn>
                <v-btn small v-else color="error" v-on:click="apply">{{ 'off' | translate }}</v-btn>
            </v-flex>
        </v-layout>
    </v-flex>
</template>

<script>
    import FlagIcon from '@/components/FlagIcon.vue';
    import StrengthIndicator from "@/components/StrengthIndicator.vue";
    import * as browser from 'webextension-polyfill';

    export default {
        name: 'Proxy',
        props: {
            proxy: Object
        },
        Components: {
            FlagIcon,
            StrengthIndicator
        },
        methods: {
            apply() {
                this.proxy.activeState = !this.proxy.activeState;

                this.$emit('proxyStateChanged', this.$vnode.key, this.proxy.activeState);
            },
            toggleFavorite() {
                const { favoriteState, ipAddress, port } = this.proxy;

                this.proxy.favoriteState = !favoriteState;

                browser.runtime.sendMessage({
                    name: 'toggle-favorite',
                    message: {
                        ipAddress: ipAddress,
                        port: port
                    }
                });
            }
        }
    }
</script>
