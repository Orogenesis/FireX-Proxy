<template>
    <span v-if="iso" class="flag-icon" :class="flagClass"></span>
</template>
<script>
    export default {
        name: 'FlagIcon',
        props: {
            iso: {
                type: String,
                default: null
            }
        },
        computed: {
            flagClass() {
                return `flag-icon-${this.iso}`;
            }
        }
    }
</script>

<style lang="scss">
    @import "~flag-icon-css/sass/flag-icon.scss";
</style>
