<template>
    <v-btn icon v-on:click="login" v-if="isExpired">
        <v-icon>input</v-icon>
    </v-btn>
    <v-btn icon v-else>
        <v-icon>face</v-icon>
    </v-btn>
</template>
<script>
    import * as browser from 'webextension-polyfill'
    import { mapGetters } from 'vuex'

    export default {
        name: "UserComponent",
        computed: {
            ...mapGetters('user', {
                name: 'name',
                isExpired: 'isExpired'
            })
        },
        methods: {
            login() {
                browser.tabs.create({
                    url: 'https://www.firexproxy.com'
                })
            }
        }
    }
</script>

<style scoped>

</style>