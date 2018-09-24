<template>
    <v-btn icon v-on:click="update">
        <v-icon>refresh</v-icon>
    </v-btn>
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
