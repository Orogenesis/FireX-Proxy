<template>
    <md-menu md-size="huge">
        <md-badge md-content="0">
            <md-button class="md-icon-button" md-menu-trigger>
                <md-icon>filter_list</md-icon>
            </md-button>
        </md-badge>
        <md-menu-content>
            <div class="filters">
                <md-switch v-model="showFavorites" class="md-primary">{{ 'favorites' | translate }}</md-switch>
            </div>
        </md-menu-content>
    </md-menu>
</template>

<script>
    export default {
        name: 'FilterList',
        data() {
            return {
                showFavorites: false
            }
        }
    }
</script>

<style lang="scss" scoped>
    .filters {
        padding: 8px 16px;
    }
</style>
