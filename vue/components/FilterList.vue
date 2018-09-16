<template>
    <md-menu md-size="huge">
        <md-badge md-content="0">
            <md-button class="md-icon-button" md-menu-trigger>
                <md-icon>filter_list</md-icon>
            </md-button>
        </md-badge>
        <md-menu-content>
            <div class="filters">
                <div class="md-layout md-gutter">
                    <div class="md-layout-item">
                        <md-switch v-model="showFavorites" class="md-primary">{{ 'favorites' | translate }}</md-switch>
                    </div>
                    <div class="md-layout-item">
                        <md-field>
                            <label for="countries">{{ 'country' | translate }}</label>
                            <md-select v-model="countryFilter" name="countries" id="countries" multiple>
                                <md-option value="australia">Australia</md-option>
                                <md-option value="brazil">Brazil</md-option>
                                <md-option value="japan">Japan</md-option>
                                <md-option value="united-states">United States</md-option>
                            </md-select>
                        </md-field>
                    </div>
                    <div class="md-layout-item">
                        <small>protocol</small>
                        <md-button class="md-dense md-primary" v-bind:class="{ 'md-raised': http }" v-on:click="switchProtocolStatus('http')">HTTP</md-button>
                        <md-button class="md-dense md-primary" v-bind:class="{ 'md-raised': socks }" v-on:click="switchProtocolStatus('socks')">SOCKS5</md-button>
                    </div>
                </div>
            </div>
        </md-menu-content>
    </md-menu>
</template>

<script>
    export default {
        name: 'FilterList',
        data() {
            return {
                showFavorites: false,
                countryFilter: [],
                http: false,
                socks: false,
            }
        },
        methods: {
            switchProtocolStatus(protocol) {
                this[protocol] = !this[protocol];
            }
        }
    }
</script>

<style lang="scss" scoped>
    .filters {
        padding: 8px 16px;
    }
    small {
        display: block;
    }
</style>
