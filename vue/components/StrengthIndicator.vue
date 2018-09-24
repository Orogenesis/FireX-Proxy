<template>
    <div class="signal-bars" :class="className">
        <div class="first-bar bar"></div>
        <div class="second-bar bar"></div>
        <div class="third-bar bar"></div>
        <div class="fourth-bar bar"></div>
    </div>
</template>

<script>
    export default {
        name: 'StrengthIndicator',
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

<style lang="scss" scoped>
    .signal-bars {
        display: inline-block;
        font-size: 0;
        .bar {
            width: 2px;
            display: inline-block;
            background-color: black;
            height: 3px;
            margin: 0 .5px -2px .5px;
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
            background-color: #BDBDBD;
        }
    }
</style>