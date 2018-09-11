import Vue from 'vue';
import * as browser from 'webextension-polyfill';

Vue.filter('translate', message => browser.i18n.getMessage(message) || message);
