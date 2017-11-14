let proxy = 'DIRECT';

/**
 * @return {string}
 */
function FindProxyForURL(url, host) {
    return proxy;
}

browser.runtime.onMessage.addListener(
    (request, sender, response) => {
        switch (request.name) {
            case 'register':
                proxy = request.proxy;
        }

        response(proxy);
    }
);