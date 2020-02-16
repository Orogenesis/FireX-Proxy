<template>
  <v-app>
    <v-toolbar color="primary" dark>
      <v-toolbar-title>FireX Proxy</v-toolbar-title>
      <v-spacer></v-spacer>
      <add-proxy-component v-show="active === 'home'"></add-proxy-component>
      <filter-list-component v-show="active === 'home'"></filter-list-component>
      <v-btn icon @click="update" v-show="active === 'home'">
        <v-icon>refresh</v-icon>
      </v-btn>
      <v-tabs
        v-model="active"
        slot="extension"
        grow
        color="transparent"
        slider-color="primary lighten-2"
      >
        <v-tab key="1" href="#home">
          {{ "home" | translate }}
        </v-tab>
        <v-tab key="2" href="#premium">
          {{ "premium" | translate }}
        </v-tab>
        <v-tab key="3" href="#websites">
          {{ "websites" | translate }}
        </v-tab>
      </v-tabs>
    </v-toolbar>
    <v-content>
      <v-tabs-items v-model="active">
        <v-tab-item :transition="false" :reverse-transition="false" lazy key="1" value="home">
          <proxy-list-component v-if="active === 'home'"></proxy-list-component>
        </v-tab-item>
        <v-tab-item :transition="false" :reverse-transition="false" lazy key="2" value="premium">
          <premium-component v-if="active === 'premium'"></premium-component>
        </v-tab-item>
        <v-tab-item :transition="false" :reverse-transition="false" lazy key="3" value="websites">
          <blacklist-component v-if="active === 'websites'"></blacklist-component>
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
    <RatingComponent></RatingComponent>
  </v-app>
</template>

<script>
  import * as browser from 'webextension-polyfill'
  import FilterListComponent from '@/components/FilterListComponent.vue'
  import AddProxyComponent from '@/components/AddProxyComponent.vue'
  import RatingComponent from '@/components/RatingComponent.vue'

  export default {
    name: 'popup',
    components: {
      RatingComponent,
      AddProxyComponent,
      FilterListComponent
    },
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
      update() {
        this.$store.dispatch('proxies/poll', true);
      },
      receiveConflicts() {
        browser.runtime.sendMessage({ name: 'get-conflicts' }).then(conflicts => this.conflicts = conflicts);
      },
      resolveConflicts() {
        this.dialog = false;
        this.conflicts = [];

        browser.runtime.sendMessage({
          name: 'resolve-conflicts'
        });
      },
      updateUser() {
        this.$store.dispatch('user/update');
      }
    },
    mounted() {
      this.receiveConflicts();
      this.updateUser();
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

    .v-window, .v-window__container, .v-window-item {
      height: 100%;
      overflow: auto;
      overflow-x: hidden;
    }
  }
</style>
