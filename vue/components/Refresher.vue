<template>
    <md-button class="md-icon-button" v-on:click="update">
        <md-icon>refresh</md-icon>
    </md-button>
</template>

<script>
    import * as constants from '@/common/constants.js';
    import bus from '@/common/bus.js';

    export default {
        name: 'Refresher',
        methods: {
            update() {
                bus.$emit(constants.PROXY_UPDATE_EVENT);
            }
        }
    }
</script>
