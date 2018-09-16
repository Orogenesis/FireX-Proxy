<template>
    <button class="bottom-button refresh" v-on:click="emitUpdate"></button>
</template>

<script>
    import * as constants from '@/common/constants.js';
    import bus from '@/common/bus.js';

    export default {
        name: 'footer-components',
        methods: {
            emitUpdate() {
                bus.$emit(constants.PROXY_UPDATE_EVENT);
            }
        }
    }
</script>

<style lang="scss">
    .bottom-button {
        padding: 25px;
        border: none;
        -moz-appearance: none;
        width: 100%;
        display: block;
        position: absolute;
        bottom: 0;
        z-index: 1;
        background-size: 20px 20px;
        background-repeat: no-repeat;
        background-position: center center;
        background-color: $primaryColorLight;
        &.refresh {
            background-image: url(~@/icons/refresh.svg);
        }
        &:hover {
            background-color: #D1E8E7;
        }
    }
</style>