import Vue from 'vue';
import * as browser from 'webextension-polyfill';

Vue.filter('translate', str => browser.i18n.getMessage(str));