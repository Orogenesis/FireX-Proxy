<template>
    <v-list-tile>
        <v-list-tile-content class="text-truncate" v-bind:class="{ 'grey--text': !isBlacklistEnabled }">
            {{ blacklistPattern }}
        </v-list-tile-content>
        <v-spacer></v-spacer>
        <v-list-tile-avatar>
            <v-btn icon flat v-on:click="remove" color="red">
                <v-icon>delete</v-icon>
            </v-btn>
        </v-list-tile-avatar>
    </v-list-tile>
</template>

<script>
    export default {
        name: "BlacklistPattern",
        props: {
            blacklistPattern: String,
            isBlacklistEnabled: Boolean
        },
        methods: {
            remove() {
                this.$emit('patternDeleted', this.$vnode.key);
            }
        }
    }
</script>

<style lang="scss" scoped>
    .v-list__tile__avatar {
        justify-content: flex-end;
    }
</style>
