<template>
    <div class="proxy-cell ping signal-bars" :class="className">
        <div class="first-bar bar"></div>
        <div class="second-bar bar"></div>
        <div class="third-bar bar"></div>
        <div class="fourth-bar bar"></div>
    </div>
</template>

<script>
    export default {
        name: 'strength-indicator',
        props: {
            strength: Number,
            strengths: Array
        },
        computed: {
            className() {
                if (this.strength <= this.strengths[0]) {
                    return 'four-bars';
                } else if (this.strength <= this.strengths[1]) {
                    return 'three-bars';
                } else if (this.strength <= this.strengths[2]) {
                    return 'two-bars';
                } else {
                    return 'one-bar';
                }
            }
        }
    }
</script>

<style lang="scss">
    .signal-bars {
        display: inline-block;
        .bar {
            width: 2px;
            margin-left: -2px;
            display: inline-block;
            background-color: $materialBlack;
            margin-bottom: -2px;
            height: 3px;
            &.second-bar {
                height: 6px;
            }
            &.third-bar {
                height: 9px;
            }
            &.fourth-bar {
                height: 12px;
            }
        }

        &.three-bars .bar.fourth-bar,
        &.one-bar .bar:not(.first-bar),
        &.two-bars .bar:not(.first-bar):not(.second-bar) {
            background-color: $materialGray;
        }
    }
</style>