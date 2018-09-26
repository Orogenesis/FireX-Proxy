<template>
    <v-app>
        <v-toolbar color="primary" :dark="true">
            <v-toolbar-title>FireX Proxy</v-toolbar-title>
            <v-spacer></v-spacer>
            <filter-list v-if="active === 0"></filter-list>
            <refresher v-if="active === 0"></refresher>
        </v-toolbar>
        <v-content>
            <proxy-list v-if="active === 0"></proxy-list>
            <blacklist v-else-if="active === 1"></blacklist>
        </v-content>
        <v-bottom-nav
                :active.sync="active"
                :dark="true"
                color="primary">
            <v-btn flat color="white">
                <span>{{ 'home' | translate }}</span>
                <v-icon>home</v-icon>
            </v-btn>

            <v-btn flat color="white">
                <span>{{ 'websites' | translate }}</span>
                <v-icon>web</v-icon>
            </v-btn>
        </v-bottom-nav>
        <v-dialog v-model="dialog" persistent>
            <v-card>
                <v-card-title class="headline">{{ 'conflict' | translate }}</v-card-title>
                <v-list class="conflicts">
                    <v-list-tile v-for="(extension, index) in this.conflicts" :key="index">
                        <v-list-tile-avatar>
                            <img :src="extension.icon">
                        </v-list-tile-avatar>
                        <v-list-tile-title>
                            {{ extension.shortName }}
                        </v-list-tile-title>
                    </v-list-tile>
                </v-list>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" flat @click="resolveConflicts()">{{ 'conflict_resolve' | translate }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>

<script>
    import ProxyList from "@/components/ProxyList.vue";
    import Refresher from "@/components/Refresher.vue";
    import FilterList from "@/components/FilterList.vue";
    import * as browser from 'webextension-polyfill';

    export default {
        name: 'popup',
        components: {
            FilterList,
            ProxyList,
            Refresher
        },
        data() {
            return {
                conflicts: [],
                active: 0,
                dialog: false
            };
        },
        watch: {
            conflicts(newVal) {
                if (newVal.length === 0) {
                    return;
                }

                this.dialog = true;
            }
        },
        methods: {
            receiveConflicts() {
                browser.runtime.sendMessage({
                    name: 'get-conflicts'
                }).then(conflicts => {
                    this.conflicts = conflicts;
                });
            },
            resolveConflicts() {
                this.dialog    = false;
                this.conflicts = [];

                browser.runtime.sendMessage({
                    name: 'resolve-conflicts'
                });
            }
        },
        mounted() {
            this.receiveConflicts();
        }
    }
</script>

<style lang="scss">
    @import "scss/main.scss";

    #app {
        height: 100%;
        .v-content {
            max-height: calc(100% - 56px - 57px);
            overflow-y: auto;
            overflow-x: hidden;
        }
        .v-bottom-nav {
            transform: unset;
        }
        .conflicts {
            img {
                height: 16px;
                width: 16px;
            }
        }
    }
</style>
