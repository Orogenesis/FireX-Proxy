[![Build Status](https://travis-ci.org/Orogenesis/FireX-Proxy.svg?branch=master)](https://travis-ci.org/Orogenesis/FireX-Proxy)

### FireX Proxy
FireX Proxy - the user's trusted Chrome and Firefox browser extension that allows you to unblock any website and browse the web privately and securely 🛡️

Firefox: https://addons.mozilla.org/firefox/addon/firex-proxy  
Google Chrome: https://chrome.google.com/webstore/detail/firex-proxy/jccfbhillgcekaepchoahodacnlhcbnj  

### Translation

Improve or suggest a translation [here](https://github.com/Orogenesis/FireX-Proxy/tree/master/_locales). See the list of supported [language codes](https://developer.chrome.com/webstore/i18n#localeTable).

### Development

1. Clone the repository: `git clone git@github.com:Orogenesis/FireX-Proxy.git`
2. Run `npm install`

#### Chrome:
1. Run `npm run build-chrome`
2. Navigate to chrome://extensions and enable "Developer Mode".
3. Choose "Load unpacked"
4. Select the dist directory

*Note that you will sometimes need to manually reload the unpacked extension, depending which files you're working on.*

#### Firefox:
1. 1. Run `npm run build-firefox`
2. Navigate to about:debugging
3. Choose `Load Temporary Add-on`
4. Select the `firex-proxy-firefox.xpi` file
