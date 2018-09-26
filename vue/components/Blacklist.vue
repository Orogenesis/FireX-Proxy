<template>
    <v-container fill-height grid-list-xs>
        <v-layout fill-height justify-center column>
            <v-layout row wrap>
                <v-flex xs6>
                    <v-switch
                            :label="this.$options.filters.translate('use_blacklist')"
                            v-model="isBlacklistEnabled"
                            color="primary"
                            :disabled="patterns.length === 0">
                    </v-switch>
                </v-flex>
                <v-flex xs6>
                    <v-text-field
                            :label="this.$options.filters.translate('search')"
                            v-model="search"
                            :error="patterns.length > 0 && filteredPatterns.length === 0"
                            :disabled="patterns.length === 0">
                    </v-text-field>
                </v-flex>
            </v-layout>
            <v-list id="blacklist-container">
                <v-slide-y-transition class="py-0" group tag="v-list" v-if="patterns.length > 0">
                    <blacklist-pattern
                            v-for="(blacklistPattern, index) in filteredPatterns"
                            :key="index"
                            v-bind="{ blacklistPattern, isBlacklistEnabled }"
                            @patternDeleted="remove">
                    </blacklist-pattern>
                </v-slide-y-transition>
                <v-container class="font-weight-medium body-1" v-else>
                    {{ 'blacklist_tip' | translate }}
                </v-container>
            </v-list>
            <v-layout column>
                <v-autocomplete
                        :items="newPatternTips"
                        :search-input.sync="newPattern"
                        v-model="newPattern"
                        @input="typing"
                        flat
                        hide-no-data
                        label="example.com"
                        solo>
                </v-autocomplete>
            </v-layout>
        </v-layout>
    </v-container>
</template>

<script>
    import * as browser from 'webextension-polyfill';
    import BlacklistPattern from '@/components/BlacklistPattern.vue';
    import Vue from 'vue';

    export default {
        name: 'Blacklist',
        components: {
            BlacklistPattern
        },
        data() {
            return {
                isBlacklistEnabled: false,
                patterns: [],
                newPattern: "",
                newPatternTips: [],
                search: ""
            }
        },
        watch: {
            isBlacklistEnabled() {
                this.save();
            },
            patterns: {
                handler() {
                    this.save();
                },
                deep: true
            },
            newPattern(newValue) {
                if (newValue) {
                    this.newPatternTips = [
                        newValue
                    ];

                    if (!newValue.startsWith('*.')) {
                        this.newPatternTips.push(`*.${newValue}`)
                    }
                } else {
                    this.newPatternTips = [];
                }
            }
        },
        computed: {
            filteredPatterns() {
                return this.patterns.filter(value => value.toLowerCase().includes(this.search.toLowerCase()));
            }
        },
        methods: {
            poll() {
                browser.storage.local.get().then(storage => {
                    this.isBlacklistEnabled = storage.isBlacklistEnabled || false;
                    this.patterns = storage.patterns || [];
                });
            },
            save() {
                browser.storage.local.set({
                    isBlacklistEnabled: this.isBlacklistEnabled,
                    patterns: this.patterns
                });
            },
            typing(newPattern) {
                const duplicate = this.patterns.indexOf(newPattern);

                if (duplicate > -1) {
                    this.patterns.splice(duplicate, 1);
                }

                this.newPattern = "";
                this.newPatternTips = [];

                this.patterns.push(newPattern);
            },
            remove(index) {
                this.patterns.splice(index, 1);

                if (this.patterns.length === 0) {
                    this.isBlacklistEnabled = false;
                }
            }
        },
        mounted() {
            this.poll();
        }
    }
</script>

<style lang="scss" scoped>
    #blacklist-container {
        height: calc(100% - 100px);
        overflow: auto;
    }
</style>
