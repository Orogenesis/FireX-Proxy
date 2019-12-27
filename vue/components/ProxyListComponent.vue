<template>
  <v-container fluid fill-height>
    <v-layout class="font-weight-bold caption" fill-height justify-center v-bind:class="{ 'align-center': items.length === 0 || !loaded }">
      <v-progress-circular
        indeterminate
        v-if="!loaded"
        color="primary"
      >
      </v-progress-circular>
      <v-container grid-list-xs v-else-if="items.length > 0">
        <v-layout justify-center column>
          <virtual-list ref="proxies" :size="50" :remain="11" :bench="20" class="virtual-list">
            <proxy-component v-for="(proxy, index) in items" :key="index" v-bind="{ proxy: proxy }"></proxy-component>
          </virtual-list>
        </v-layout>
      </v-container>
      <span class="body-2" v-else>
        {{ 'no_proxy' | translate }} <span class="reset-button primary--text" @click="resetFilters">{{ 'reset_filters' | translate }}.</span>
      </span>
    </v-layout>
  </v-container>
</template>

<script>
  import ProxyComponent from '@/components/ProxyComponent.vue'
  import { mapState } from 'vuex'
  import virtualList from 'vue-virtual-scroll-list'

  export default {
    name: 'ProxyListComponent',
    components: {
      ProxyComponent,
      virtualList
    },
    methods: {
      applySelectedCountries({ country }) {
        return this.countries.length === 0 || this.countries.indexOf(country) > -1;
      },
      applySelectedProtocols({ protocol }) {
        return this.protocols.indexOf(protocol) > -1;
      },
      applyFavorite({ favoriteState }) {
        return this.favorites || favoriteState === this.favorites;
      },
      resetFilters() {
        this.$store.commit('filters/resetFilters');
        this.$store.dispatch('filters/save');
      }
    },
    watch: {
      items() {
        this.$refs.proxies.forceRender();
      }
    },
    computed: {
      items() {
        return this.proxies
          .filter(this.applyFavorite)
          .filter(this.applySelectedCountries)
          .filter(this.applySelectedProtocols);
      },
      ...mapState('proxies', {
        loaded: 'loaded',
        proxies: 'items'
      }),
      ...mapState('filters', {
        favorites: 'favorites',
        protocols: 'protocolFilter',
        countries: 'countryFilter'
      })
    },
    mounted() {
      this.$store.dispatch('proxies/poll');
    }
  }
</script>

<style lang="scss" scoped>
  .reset-button {
    text-decoration-style: solid;
    cursor: pointer;
  }

  .container {
    padding: 0;
    margin: 0;
    .layout {
      height: 100%;
      .virtual-list {
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
      }
    }
  }
</style>
