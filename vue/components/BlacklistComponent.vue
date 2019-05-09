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
                    <blacklist-pattern-component
                            v-for="(blacklistPattern, index) in filteredPatterns"
                            :key="index"
                            v-bind="{ blacklistPattern, isBlacklistEnabled }">
                    </blacklist-pattern-component>
                </v-slide-y-transition>
                <v-container class="font-weight-medium body-1" v-else>
                    {{ 'blacklist_tip' | translate }}
                </v-container>
            </v-list>
            <v-text-field
                    label="facebook.com"
                    v-model.trim="newPattern"
                    clearable
                    box
                    append-icon="send"
                    @click:append="submit"
                    @keyup.enter="submit">
            </v-text-field>
        </v-layout>
    </v-container>
</template>

<script>
    import BlacklistPatternComponent from '@/components/BlacklistPatternComponent.vue'
    import { mapState } from 'vuex'

    export default {
        name: 'BlacklistComponent',
        components: {
            BlacklistPatternComponent
        },
        data() {
            return {
                newPattern: String(),
                search: String(),
                polled: false
            }
        },
        computed: {
            filteredPatterns() {
                return this.patterns.filter(value => value.toLowerCase().includes(this.search.toLowerCase()));
            },
            ...mapState('patterns', {
                patterns: 'patterns'
            }),
            isBlacklistEnabled: {
                get() {
                    return this.$store.state.patterns.isBlacklistEnabled;
                },
                set(newState) {
                    this.$store.commit('patterns/setBlacklistEnabled', newState);
                    this.$store.dispatch('patterns/save');
                }
            }
        },
        methods: {
            poll() {
                this.$store.dispatch('patterns/poll').then(() => this.polled = true)
            },
            submit() {
                if (!this.newPattern.length) {
                    return;
                }

                const duplicate = this.patterns.indexOf(this.newPattern);

                if (duplicate > -1) {
                    this.$store.commit('patterns/removePattern', duplicate);
                }

                this.$store.commit('patterns/addPattern', this.newPattern);
                this.$store.dispatch('patterns/save');
                this.newPattern = '';
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
