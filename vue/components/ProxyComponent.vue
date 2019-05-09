<template>
    <v-flex xs12>
        <v-layout row align-center :class="{ 'primary lighten-4': proxy.activeState }">
            <v-flex xs2>
                <v-btn icon flat @click="toggleFavorite" :color="proxy.favoriteState ? 'red' : 'black'">
                    <v-icon small>thumb_up</v-icon>
                </v-btn>
            </v-flex>
            <v-flex xs6 v-if="proxy.isoCode && proxy.country !== 'Unknown'">
                <v-layout row align-center>
                    <v-flex xs2>
                        <flag-icon-component class="flag-icon-circle" v-bind="{ iso: proxy.isoCode }"></flag-icon-component>
                    </v-flex>
                    <v-flex class="text-truncate" xs10>
                        {{ proxy.country }}
                    </v-flex>
                </v-layout>
            </v-flex>
            <v-flex xs6 v-else>
                {{ proxy.ipAddress }}:{{ proxy.port }}
            </v-flex>
            <v-flex xs1>
                <strength-indicator-component v-bind="{ strength: proxy.pingTimeMs, strengths: [300, 1000, 3000] }"></strength-indicator-component>
            </v-flex>
            <v-flex xs2>
                {{ proxy.protocol }}
            </v-flex>
            <v-flex xs3>
                <v-btn small v-if="!proxy.activeState" color="primary lighten-1" dark @click="connect">{{ 'on' | translate }}</v-btn>
                <v-btn small v-else color="error" @click="disconnect">{{ 'off' | translate }}</v-btn>
            </v-flex>
        </v-layout>
    </v-flex>
</template>

<script>
    import FlagIconComponent from '@/components/FlagIconComponent.vue'
    import StrengthIndicatorComponent from "@/components/StrengthIndicatorComponent.vue"

    export default {
        components: {
            StrengthIndicatorComponent,
            FlagIconComponent
        },
        name: 'ProxyComponent',
        props: ['proxy'],
        methods: {
            connect() {
                this.$store.dispatch('proxies/connect', this.proxy);
            },
            disconnect() {
                this.$store.dispatch('proxies/disconnect');
            },
            toggleFavorite() {
                this.$store.dispatch('proxies/toggleFavorite', this.proxy);
            }
        }
    }
</script>
