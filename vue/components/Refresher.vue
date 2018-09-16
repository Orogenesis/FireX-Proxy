<template>
    <i class="refresh" v-on:click="update"></i>
</template>

<script>
    import * as constants from '@/common/constants.js';
    import bus from '@/common/bus.js';

    export default {
        name: 'refresher',
        methods: {
            update() {
                bus.$emit(constants.PROXY_UPDATE_EVENT);
            }
        }
    }
</script>

<style lang="scss">
    i.refresh {
        background-image: url(~@/icons/refresh.svg);
        background-size: 16px 16px;
        background-repeat: no-repeat;
        background-position: center left;
        height: 24px;
        width: 24px;
        display: inline-block;
        cursor: pointer;
    }
</style>
