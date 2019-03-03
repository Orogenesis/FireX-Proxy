<template>
    <v-app>
        <v-toolbar color="primary" dark>
            <v-toolbar-title>FireX Proxy</v-toolbar-title>
            <v-spacer></v-spacer>
            <add-proxy-component v-if="active === 'home'"></add-proxy-component>
            <filter-list-component v-if="active === 'home'"></filter-list-component>
            <refresher-component v-if="active === 'home'"></refresher-component>
            <v-tabs v-model="active"
                    slot="extension"
                    grow
                    color="transparent"
                    slider-color="primary lighten-2">
                <v-tab key="1" href="#home">
                    {{ "home" | translate }}
                </v-tab>
                <v-tab key="2" href="#websites">
                    {{ "websites" | translate }}
                </v-tab>
            </v-tabs>
        </v-toolbar>
        <v-content>
            <v-tabs-items v-model="active">
                <v-tab-item lazy key="1" id="home">
                    <proxy-list-component v-show="active === 'home'"></proxy-list-component>
                </v-tab-item>
                <v-tab-item lazy key="2" id="websites">
                    <blacklist-component v-show="active === 'websites'"></blacklist-component>
                </v-tab-item>
            </v-tabs-items>
        </v-content>
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
    import * as browser from 'webextension-polyfill'

    export default {
        name: 'popup',
        data() {
            return {
                conflicts: [],
                active: 'home',
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
                this.dialog = false;
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
        }
        .conflicts {
            img {
                height: 16px;
                width: 16px;
            }
        }

        .v-tabs__items, .v-tabs__content {
            height: 100%;
            overflow: auto;
            overflow-x: hidden;
        }
    }
</style>
