<template>
    <md-content class="proxy-row" v-bind:class="{ active: proxy.activeState }">
        <div class="proxy-row-left">
            <md-button class="md-icon-button md-transparent" v-bind:class="{ 'md-accent': proxy.favoriteState }" v-on:click="toggleFavorite">
                <md-icon>thumb_up</md-icon>
            </md-button>
            <flag-icon class="proxy-cell flag-icon-circle" v-bind="{ iso: proxy.isoCode.toLowerCase() }" />
            <span class="proxy-cell country">{{ proxy.country }}</span>
        </div>
        <div class="proxy-row-right">
            <strength-indicator class="proxy-cell ping" v-bind="{ strength: proxy.pingTimeMs, strengths: [300, 1000, 3000] }"></strength-indicator>
            <span class="proxy-cell protocol">{{ proxy.protocol }}</span>
            <div class="proxy-cell apply" v-on:click="apply">
                <md-button class="md-dense md-raised md-primary" v-if="!proxy.activeState">{{ 'on' | translate }}</md-button>
                <md-button class="md-dense md-raised md-accent" v-else>{{ 'off' | translate }}</md-button>
            </div>
        </div>
    </md-content>
</template>

<script>
    import FlagIcon from '@/components/FlagIcon.vue';
    import StrengthIndicator from "@/components/StrengthIndicator.vue";
    import * as browser from 'webextension-polyfill';

    export default {
        name: 'proxy',
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
                this.proxy.favoriteState = !this.proxy.favoriteState;

                browser.runtime.sendMessage({
                    name: 'toggle-favorite',
                    message: {
                        ipAddress: this.proxy.ipAddress,
                        port: this.proxy.port
                    }
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "~vue-material/dist/theme/engine";

    .proxy-row {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 10px;
        height: 60px;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        .proxy-row-left {
            min-width: 180px;
        }
        .proxy-row-right {
            margin-left: auto;
        }
        .proxy-cell {
            display: inline-block;
            .md-checkbox {
                margin: 0 !important;
            }
            &.favorite,
            &.flag-icon {
                width: 28px;
            }
            &.protocol {
                width: 50px;
            }
            &.ping {
                width: 40px;
            }
            &.apply {
                width: 100px;
            }
        }
        .md-button {
            vertical-align: middle !important;
        }
        &.active {
            background: md-get-palette-color(lightblue, 100);
        }
    }
</style>
