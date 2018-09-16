<template>
    <div class="proxy-row" v-bind:class="{ active: proxy.activeState }">
        <div class="proxy-row-left">
            <span class="proxy-cell checkbox star" v-bind:class="{ active: proxy.favoriteState }"></span>
            <flag-icon class="proxy-cell flag-icon-circle" v-bind="{ iso: proxy.isoCode.toLowerCase() }" />
            <span class="proxy-cell country">{{ proxy.country }}</span>
        </div>
        <div class="proxy-row-right">
            <strength-indicator class="proxy-cell ping" v-bind="{ strength: proxy.pingTimeMs, strengths: [300, 1000, 3000] }"></strength-indicator>
            <span class="proxy-cell protocol">{{ proxy.protocol }}</span>
            <div class="proxy-cell apply" v-on:click="applyClicked">
                <button class="apply-btn">{{ 'apply' | translate }}</button>
            </div>
        </div>
    </div>
</template>

<script>
    import FlagIcon from '@/components/FlagIcon.vue';
    import StrengthIndicator from "./StrengthIndicator.vue";

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
            applyClicked() {
                this.proxy.activeState = !this.proxy.activeState;

                this.$emit('proxyStateChanged', this.$vnode.key);
            }
        }
    }
</script>

<style lang="scss">
    .proxy-row {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 10px;
        line-height: 60px;
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
            color: $materialBlack;
            &.favorite,
            &.flag-icon {
                width: 28px;
            }
            &.protocol {
                width: 70px;
            }
            &.ping {
                width: 45px;
            }
            &.apply {
                width: 70px;
                .apply-btn {
                    font-weight: 500;
                    text-align: center;
                    text-transform: uppercase;
                    padding: 7.5px 16px;
                    border-radius: 2px;
                    color: $primaryColor;
                    background: $primaryColorLight;
                    border: none;
                }
            }
        }
        &.active {
            background-color: $primaryColorLight;
            .proxy-cell {
                &.apply {
                    .apply-btn {
                        background: #ff7970;
                        color: white;
                    }
                }
            }
        }

        .checkbox {
            &.star {
                background-image: url(~@/icons/star.svg);
            }
        }
    }
</style>