<template>
    <span v-if="iso" class="flag-icon" :class="flagClass"></span>
</template>
<script>
    export default {
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