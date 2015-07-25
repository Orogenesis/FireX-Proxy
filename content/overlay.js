if (typeof wrapper == 'undefined') var wrapper = {};

var ProxyAddonBar = {
    PING_TIMES: 10, // const
    proxyList: [],
    prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
    stringBundle: null,
    ip_address: null,
    proxyManager: null,

    onLoad: function (str) {
        this.stringBundle = str;

        if (this.isFirstRun()) {
            /* icon */
            this.addIcon("nav-bar", "myextension-button");
            this.addIcon("addon-bar", "myextension-button");
            /* ip address */
            this.addIcon("nav-bar", "ip-address");
            this.addIcon("addon-bar", "ip-address");
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
        this.reset();
        var self = this;
        this.parseProxyList(function (ip_addr) {
            var rand_proxy = self.randomProxy(ip_addr);
            self.proxyManager.start(rand_proxy[0], rand_proxy[1], rand_proxy[3]);
            self.ip_address.children[0].value = self.getIPAddress();
            self.proxyList = ip_addr;
            self.addItemsToProxyList();
        });
    },
    disable: function () {
        this.proxyManager.stop();
        this.reset();
    },
    reset: function () {
        if (this.ip_address) {
            this.ip_address.children[0].style.color = '#12B300';
            this.ip_address.children[0].value = this.stringBundle.getString('proxyIsDisabled');
        }
    },
    ping: function () {
        var self = this;
        this.pingLogic(function (times) {
            if (self.ip_address) {
                self.ip_address.children[0].value = self.getIPAddress();
                self.ip_address.children[0].style.color = (times < self.PING_TIMES) ? '#12B300' : '#B30000';
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
        } else {
            event.currentTarget.removeAttribute('class');
        }
    },
    changeProxy: function () {
        var hbox = document.getElementById('proxy-list-box').getElementsByTagName('hbox');

        for (var i = 0; i < hbox.length; i++) {
            if (hbox[i].className.length) {
                var hbox_child = hbox[i].children[0];
                var proxy_type = hbox[i].getElementsByClassName('proxy-type')[0].innerHTML.toLowerCase();

                this.proxyManager.start(hbox_child.value, hbox_child.getAttribute('data-port'), proxy_type);
                document.getElementById('ip-address').children[0].value = ProxyAddonBar.getIPAddress();
                break;
            }
        }
    },
    refresh: function () {
        this.reset();
        this.removeProxyList();
        var self = this;

        this.parseProxyList(function (ip_addr) {
            self.proxyList = ip_addr;
            self.addItemsToProxyList();
        });
    },
    getIPAddress: function () {
        return this.proxyManager.proxyData.enabled ? this.proxyManager.proxyData.address : this.stringBundle.getString('proxyIsDisabled');
    },
    randomProxy: function (proxy) {
        return proxy[parseInt(Math.random() * proxy.length - 1)];
    },
    pingLogic: function (callback) {
        var self = this;
        wrapper.req = new XMLHttpRequest();
        wrapper.win = window.open("chrome://FireX/content/loading.xul", "", "chrome");
        wrapper.pinged = 0;
        wrapper.isCompleted = false;
        wrapper.win.onload = function () {
            wrapper.win.document.getElementById('loading_description').value = self.stringBundle.getString('waitCheckSpeed');
        };

        var interval = setInterval(function () {
            wrapper.win.document.getElementById('loading_description').value = self.stringBundle.getString('doneSeconds') + ': ' + parseInt(self.PING_TIMES - wrapper.pinged) + ' ' + self.stringBundle.getString('seconds');

            if (wrapper.pinged >= self.PING_TIMES) {
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
        };
        wrapper.req.send(null);
    },
    addItemsToProxyList: function () {
        for (var i = 0; i < this.proxyList.length; i++) {
            this.addProxyItem(this.proxyList[i][0], this.proxyList[i][1], this.proxyList[i][2], this.proxyList[i][3]);
        }
    },
    removeProxyList: function () {
        var proxy_list = document.getElementById('proxy-list-box');

        while (proxy_list.firstChild) proxy_list.removeChild(proxy_list.firstChild);
    },
    addProxyItem: function (value, port, country, type) {
        var self = this;
        wrapper.xulNS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
        wrapper.hbox = document.createElementNS(wrapper.xulNS, 'hbox');
        wrapper.element = document.createElementNS(wrapper.xulNS, 'label');
        wrapper.el_country = document.createElementNS(wrapper.xulNS, 'label');
        wrapper.el_type = document.createElementNS(wrapper.xulNS, 'label');

        wrapper.element.setAttribute('value', value);
        wrapper.element.setAttribute('data-port', port);

        wrapper.hbox.addEventListener('click', function (e) {
            self.chooseProxy(e);
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
                    var doc = new DOMParser().parseFromString(req.responseText, "text/html");
                    var ip_addr = [];
                    var doc_table = doc.getElementById("listable");

                    if (doc_table != undefined) {
                        var doc_tr = doc_table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

                        for (var i = 0; i < doc_tr.length; i++) {
                            var doc_td = [];

                            for (var d = 0; d <= 5; d++) doc_td.push(doc_tr[i].getElementsByTagName("td")[d + 1]);

                            var span = doc_td[0].getElementsByTagName('span')[0];
                            var loopAddr = [];
                            var proxyCondition = {
                                proxySpeed: parseInt(doc_td[3].getElementsByClassName('progress-indicator')[0].children[0].style.width),
                                connectionTime: parseInt(doc_td[4].getElementsByClassName('progress-indicator')[0].children[0].style.width),
                                country: doc_td[2].getElementsByTagName('span')[0].textContent,
                                proxyType: doc_td[5].innerHTML.toLowerCase()
                            };

                            if (proxyCondition.connectionTime < 60 || proxyCondition.proxySpeed < 40) continue;

                            if (proxyCondition.proxyType != 'http' && proxyCondition.proxyType != 'https') continue;

                            var match = span.getElementsByTagName('style')[0].innerHTML.match(/([^\n|.]+display:(?!none))/g),
                                allElements = span.childNodes;

                            for (var b = 0; b < allElements.length; b++) {
                                var this_span = allElements[b],
                                    isLoop = false;

                                if (this_span.textContent.length && this_span.tagName == undefined) {
                                    loopAddr.push(this_span.textContent);
                                    continue;
                                }

                                if (this_span.style.display == "none") continue;

                                if (this_span.tagName.toLowerCase() == 'style') continue;

                                if (this_span.className.length) {
                                    for (var r = 0; r < match.length; r++) {
                                        if (match[r].replace(/{.*/, '') == this_span.className) {
                                            isLoop = true;
                                            break;
                                        }
                                    }
                                }

                                if (!this_span.innerHTML.length || this_span.innerHTML === '.') continue;

                                if (!this_span.className.match(/^[0-9]+$/) && !isLoop && !this_span.style.display) continue;

                                loopAddr.push(this_span.innerHTML);
                            }

                            ip_addr.push([
                                loopAddr.join('.').replace(/\.{2,}/g, '.'),
                                doc_td[1].innerHTML.replace(/\s/g, ''),
                                proxyCondition.country,
                                proxyCondition.proxyType
                            ]);
                        }
                    }

                    callback(ip_addr);
                }
            }
        };
        req.send(null);
    },
    openList: function () {
        document.getElementById('proxy-list-panel').openPopupAtScreen((document.width / 2) - 225, (document.height / 2) - 175, false);
    },
    isFirstRun: function () {
        var firstRun = this.prefs.getBoolPref('extensions.firex.firstRun'), currentVersion = 3.8;

        if (firstRun) {
            this.prefs.setBoolPref('extensions.firex.firstRun', false);
            this.prefs.setCharPref('extensions.firex.installedVersion', currentVersion);
        }

        if (parseFloat(this.prefs.getCharPref('extensions.firex.installedVersion')) < currentVersion) {
            this.prefs.setCharPref('extensions.firex.installedVersion', currentVersion.toString());
            return true;
        }

        return firstRun;
    }
};

ProxyAddonBar.proxyManager = new ProxyManager();

window.addEventListener("load", function (e) {
    ProxyAddonBar.onLoad(document.getElementById('firex-string-bundle'));

    var ip_address = document.getElementById('ip-address');

    if (ip_address) {
        ip_address.children[0].value = ProxyAddonBar.getIPAddress();
        ProxyAddonBar.ip_address = ip_address;
    }
}, false);