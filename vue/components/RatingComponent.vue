<template>
  <v-dialog v-model="show" persistent>
    <v-card class="elevation-16 mx-auto">
      <v-card-title
        class="headline"
        primary-title
      >
        {{ 'rate_title' | translate }}
      </v-card-title>
      <div v-if="completed === false">
        <v-card-text class="body-2">
          {{ 'rate_text' | translate }}
          <div class="text-xs-center mt-3">
            <v-rating
              v-model="rating"
              color="yellow darken-3"
              background-color="grey darken-1"
              empty-icon="$vuetify.icons.ratingFull"
              hover
            ></v-rating>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn small flat @click="onClose">
            {{ 'skip' | translate }}
          </v-btn>
        </v-card-actions>
      </div>
      <div v-else>
        <v-card-text class="body-2">
          {{ 'leave_feedback' | translate }}
          <div class="text-xs-center mt-3">
            <v-img v-if="isFirefox" :src="require('@/assets/firefox.png')"></v-img>
            <v-img v-else :src="require('@/assets/chrome.png')"></v-img>
            <div class="mt-3">
              <v-btn color="pink" outline dark @click="onRedirect">
                {{ 'go_to_market' | translate }}
              </v-btn>
            </div>
          </div>
        </v-card-text>
        <v-card-actions v-if="completed === false" class="justify-end">
          <v-btn small flat @click="onClose">
            {{ 'skip' | translate }}
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  import * as browser from 'webextension-polyfill'
  import { mapState } from 'vuex'

  import {
    isFirefox,
    getMarketURL
  } from '@/util'

  export default {
    name: 'RatingComponent',
    data: () => ({
      rating: 1,
      show: false
    }),
    watch: {
      rating: function (newRating, _) {
        if (newRating < 5) {
          this.onClose();
        } else {
          this.$store.dispatch('rating/updateRated', true);
        }
      }
    },
    computed: {
      isFirefox,
      ...mapState('rating', {
        completed: 'rated'
      }),
    },
    methods: {
      onRedirect() {
        browser.tabs.create({ url: getMarketURL() }).then(_ => this.onClose())
      },
      onClose() {
        browser.storage.local.set({ rateHidden: true });
        this.show = false;
      }
    },
    async mounted() {
      await this.$store.dispatch('rating/getRated');
      browser.storage.local.get(['rateHidden', 'installedAt']).then(v => {
        const { rateHidden = false, installedAt = 0 } = v;

        if (rateHidden) {
          return
        }

        const delta = Math.max(Math.floor((new Date().getTime() - installedAt) / (1000 * 60 * 60 * 24)), 0);

        if (delta === 0) {
          return
        }

        this.show = true;
      });
    }
  }
</script>
