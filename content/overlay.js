if (typeof wrapper == 'undefined') var wrapper = {};

var ProxyAddonBar = {

    proxyList: [],
    prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
    stringBundle: null,
    ip_address: null,

    onLoad: function (str) {
        ProxyAddonBar.stringBundle = str;

        if (ProxyAddonBar.isFirstRun()) {
            /* icon */
            ProxyAddonBar.addIcon("nav-bar", "myextension-button");
            ProxyAddonBar.addIcon("addon-bar", "myextension-button");
            /* ip address */
            ProxyAddonBar.addIcon("nav-bar", "ip-address");
            ProxyAddonBar.addIcon("addon-bar", "ip-address");
        }
    },
    addIcon: function (toolbarId, id) {
        if (!document.getElementById(id)) {
            var toolbar = document.getElementById(toolbarId);

            toolbar.insertItem(id, null);
            toolbar.setAttribute("currentset", toolbar.currentSet);

            document.persist(toolbar.id, "currentset");

            if (toolbarId == "addon-bar") {
                toolbar.collapsed = false;
            }
        }
    },
    activate: function () {
        ProxyAddonBar.reset();
        ProxyAddonBar.parseProxyList(function (ip_addr) {
            var rand_proxy = ProxyAddonBar.randomProxy(ip_addr);

            if (rand_proxy[3] == 'http') {
                ProxyAddonBar.connectTo(rand_proxy);
            }
            else {
                ProxyAddonBar.connectToSSL(rand_proxy);
            }

            if (ProxyAddonBar.ip_address) {
                ProxyAddonBar.ip_address.children[0].value = ProxyAddonBar.getIPAddress();
            }

            ProxyAddonBar.proxyList = ip_addr;

            ProxyAddonBar.addItemsToProxyList();
        });
    },
    reset: function () {
        ProxyAddonBar.resetConfig();
        if (ProxyAddonBar.ip_address) {
            ProxyAddonBar.ip_address.children[0].style.color = '#12B300';
            ProxyAddonBar.ip_address.children[0].value = ProxyAddonBar.stringBundle.getString('proxyIsDisabled');
        }
    },
    ping: function () {
        ProxyAddonBar.pingLogic(function (times) {
            if (ProxyAddonBar.ip_address) {
                ProxyAddonBar.ip_address.children[0].value = ProxyAddonBar.getIPAddress() || ProxyAddonBar.stringBundle.getString('proxyIsDisabled');
                ProxyAddonBar.ip_address.children[0].style.color = (times < 8) ? '#12B300' : '#B30000';
            }
        });
    },
    chooseProxy: function (event) {
        if (!event.currentTarget.className.length) {
            var elements = document.getElementsByClassName('proxy-list')[0].childNodes;

            if (elements != undefined) {
                for (var i = elements.length - 1; i >= 0; --i) {
                    if (elements[i].className == 'active') {
                        elements[i].className = '';
                        break;
                    }
                }
            }

            event.currentTarget.setAttribute('class', 'active');
        }
        else {
            event.currentTarget.removeAttribute('class');
        }
    },
    changeProxy: function () {
        ProxyAddonBar.resetConfig();

        var hbox = document.getElementById('proxy-list-box').getElementsByTagName('hbox');

        for (var i = 0; i < hbox.length; i++) {
            if (hbox[i].className.length) {
                var hbox_child = hbox[i].children[0],
                    proxy_type = hbox[i].getElementsByClassName('proxy-type')[0].innerHTML.toLowerCase();

                if (proxy_type == 'http') {
                    ProxyAddonBar.connectTo([hbox_child.value, hbox_child.getAttribute('data-port')]);
                }
                else {
                    ProxyAddonBar.connectToSSL([hbox_child.value, hbox_child.getAttribute('data-port')]);
                }

                if (ProxyAddonBar.ip_address) {
                    document.getElementById('ip-address').children[0].value = ProxyAddonBar.getIPAddress();
                }

                break;
            }
        }
    },
    refresh: function () {
        ProxyAddonBar.reset();
        ProxyAddonBar.removeProxyList();

        ProxyAddonBar.parseProxyList(function (ip_addr) {
            ProxyAddonBar.proxyList = ip_addr;
            ProxyAddonBar.addItemsToProxyList();
        });
    },
    getIPAddress: function () {
        return ProxyAddonBar.prefs.getCharPref('network.proxy.http');
    },
    resetConfig: function () {
        ProxyAddonBar.prefs.clearUserPref('network.proxy.http');
        ProxyAddonBar.prefs.clearUserPref('network.proxy.http_port');
        ProxyAddonBar.prefs.clearUserPref('network.proxy.type');

        ProxyAddonBar.prefs.clearUserPref('network.proxy.ssl');
        ProxyAddonBar.prefs.clearUserPref('network.proxy.ssl_port');
    },
    connectTo: function (addr) {
        ProxyAddonBar.prefs.setCharPref('network.proxy.http', addr[0]);
        ProxyAddonBar.prefs.setIntPref('network.proxy.http_port', addr[1]);
        ProxyAddonBar.prefs.setIntPref('network.proxy.type', 1);
    },
    connectToSSL: function (addr) {
        ProxyAddonBar.prefs.setCharPref('network.proxy.http', addr[0]);
        ProxyAddonBar.prefs.setIntPref('network.proxy.http_port', addr[1]);

        ProxyAddonBar.prefs.setCharPref('network.proxy.ssl', addr[0]);
        ProxyAddonBar.prefs.setIntPref('network.proxy.ssl_port', addr[1]);
        ProxyAddonBar.prefs.setIntPref('network.proxy.type', 1);
    },
    randomProxy: function (proxy) {
        return proxy[parseInt(Math.random() * proxy.length - 1)];
    },
    pingLogic: function (callback) {
        wrapper.req = new XMLHttpRequest(),
            wrapper.win = window.open("chrome://FireX/content/loading.xul", "", "chrome");
        wrapper.pinged = 0,
            wrapper.isCompleted = false;

        wrapper.win.onload = function () {
            wrapper.win.document.getElementById('loading_description').value = ProxyAddonBar.stringBundle.getString('waitCheckSpeed');
        }

        var interval = setInterval(function () {
            wrapper.win.document.getElementById('loading_description').value = ProxyAddonBar.stringBundle.getString('doneSeconds') + ': ' + parseInt(8 - wrapper.pinged) + ' ' + ProxyAddonBar.stringBundle.getString('seconds');

            if (wrapper.pinged >= 8) {
                wrapper.win.close();
                clearInterval(interval);

                wrapper.isCompleted = true;

                return callback(wrapper.pinged);
            }

            wrapper.pinged++;

        }, 1000);

        wrapper.req.open('GET', 'http://www.mozilla.org/', true);
        wrapper.req.onreadystatechange = function () {
            if (wrapper.req.readyState == 4) {
                wrapper.win.close();
                clearInterval(interval);
                if (!wrapper.isCompleted) {
                    callback(wrapper.pinged);
                }
            }
        }
        wrapper.req.send(null);
    },
    addItemsToProxyList: function () {
        for (var i = 0; i < ProxyAddonBar.proxyList.length; i++) {
            ProxyAddonBar.addProxyItem(ProxyAddonBar.proxyList[i][0], ProxyAddonBar.proxyList[i][1], ProxyAddonBar.proxyList[i][2], ProxyAddonBar.proxyList[i][3]);
        }
    },
    removeProxyList: function () {
        var proxy_list = document.getElementById('proxy-list-box');

        while (proxy_list.firstChild) proxy_list.removeChild(proxy_list.firstChild);
    },
    addProxyItem: function (value, port, country, type) {
        wrapper.xulNS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
            wrapper.hbox = document.createElementNS(wrapper.xulNS, 'hbox');
        wrapper.element = document.createElementNS(wrapper.xulNS, 'label'),
            wrapper.el_country = document.createElementNS(wrapper.xulNS, 'label'),
            wrapper.el_type = document.createElementNS(wrapper.xulNS, 'label');

        wrapper.element.setAttribute('value', value);
        wrapper.element.setAttribute('data-port', port);

        wrapper.hbox.addEventListener('click', function (e) {
            ProxyAddonBar.chooseProxy(e);
        }, false);

        wrapper.el_country.textContent = country;
        wrapper.el_country.setAttribute('class', 'proxy-country');

        wrapper.el_type.textContent = type.toUpperCase();
        wrapper.el_type.setAttribute('class', 'proxy-type');

        document.getElementById('proxy-list-box').appendChild(wrapper.hbox);
        wrapper.hbox.appendChild(wrapper.element);
        wrapper.hbox.appendChild(wrapper.el_type);
        wrapper.hbox.appendChild(wrapper.el_country);
    },
    parseProxyList: function (callback) {
        var req = new XMLHttpRequest();
        req.open('GET', 'http://proxylist.hidemyass.com/', true);

        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var response = req.responseText;
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(response, "text/html");
                    var doc_table = doc.getElementById("listable");
                    var doc_tr = doc_table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
                    var ip_addr = [];

                    for (var i = 0; i < doc_tr.length; i++) {
                        var doc_td = [];

                        for (var d = 0; d <= 5; d++) {
                            doc_td.push(doc_tr[i].getElementsByTagName("td")[d + 1]);
                        }

                        var span = doc_td[0].getElementsByTagName('span')[0];
                        var loopAddr = '';
                        var proxySpeed = doc_td[3].getElementsByClassName('progress-indicator')[0].children[0].style.width;
                        var connectionTime = doc_td[4].getElementsByClassName('progress-indicator')[0].children[0].style.width;
                        var country = doc_td[2].getElementsByTagName('span')[0].textContent;
                        var proxy_type = doc_td[5].innerHTML.toLowerCase();

                        if (connectionTime < parseInt(connectionTime) || parseInt(proxySpeed) < 40) {
                            continue;
                        }

                        if (proxy_type != 'http' && proxy_type != 'https') {
                            continue;
                        }

                        var match = span.getElementsByTagName('style')[0].innerHTML.match(/([^\n|.]+display:(?!none))/g),
                            allElements = span.childNodes;

                        for (var b = 0; b < allElements.length; b++) {
                            var this_span = allElements[b],
                                isLoop = false;

                            if (this_span.textContent.length && this_span.tagName == undefined) {
                                loopAddr += (loopAddr.length) ? '.' + this_span.textContent : this_span.textContent;
                                continue;
                            }

                            if (this_span.style.display == "none") {
                                continue;
                            }

                            if (this_span.tagName.toLowerCase() == 'style') {
                                continue;
                            }

                            if (this_span.className.length) {
                                for (var r = 0; r < match.length; r++) {
                                    if (match[r].replace(/{.*/, '') == this_span.className) {
                                        isLoop = true;
                                        break;
                                    }
                                }
                            }

                            if (!this_span.innerHTML.length || this_span.innerHTML === '.') {
                                continue;
                            }

                            if (!this_span.className.match(/^[0-9]+$/) && !isLoop && !this_span.style.display) {
                                continue;
                            }

                            loopAddr += (loopAddr.length) ? '.' + this_span.innerHTML : this_span.innerHTML;
                        }

                        ip_addr.push([
                            loopAddr.replace(/\.{2,}/g, '.'), doc_td[1].innerHTML, country, proxy_type
                        ]);
                    }

                    callback(ip_addr);
                }
            }
        }
        req.send(null);
    },
    openList: function () {
        document.getElementById('proxy-list-panel').openPopupAtScreen((document.width / 2) - 225, (document.height / 2) - 175, false);
    },
    isFirstRun: function () {
        var firstRun = ProxyAddonBar.prefs.getBoolPref('extensions.firex.firstRun'),
            currentVersion = 3.6;
        if (firstRun) {
            ProxyAddonBar.prefs.setBoolPref('extensions.firex.firstRun', false);
            ProxyAddonBar.prefs.setCharPref('extensions.firex.installedVersion', currentVersion);
        }

        if (parseFloat(ProxyAddonBar.prefs.getCharPref('extensions.firex.installedVersion')) < currentVersion) {
            ProxyAddonBar.prefs.setCharPref('extensions.firex.installedVersion', currentVersion.toString());

            return true;
        }

        return firstRun;
    }
};

window.addEventListener("load", function (e) {
    ProxyAddonBar.onLoad(document.getElementById('firex-string-bundle'));

    var ip_address = document.getElementById('ip-address');
    if (ip_address) {
        ip_address.children[0].value = ProxyAddonBar.getIPAddress() || ProxyAddonBar.stringBundle.getString('proxyIsDisabled');

        ProxyAddonBar.ip_address = ip_address;
    }
}, false);