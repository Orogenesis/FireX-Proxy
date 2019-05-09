<template>
    <v-list-tile>
        <v-list-tile-content class="text-truncate" :class="{ 'grey--text': !isBlacklistEnabled }">
            {{ blacklistPattern }}
        </v-list-tile-content>
        <v-spacer></v-spacer>
        <v-list-tile-avatar>
            <v-btn icon flat @click="remove" color="red">
                <v-icon>delete</v-icon>
            </v-btn>
        </v-list-tile-avatar>
    </v-list-tile>
</template>

<script>
    export default {
        name: "BlacklistPatternComponent",
        props: ['blacklistPattern', 'isBlacklistEnabled'],
        methods: {
            remove() {
                this.$store.dispatch('patterns/remove', this.$vnode.key);
            }
        }
    }
</script>

<style lang="scss" scoped>
    .v-list__tile__avatar {
        justify-content: flex-end;
    }
</style>
