if (!com) var com = {};
if (!com.firexProxyPackage) com.firexProxyPackage = {};

com.firexProxyPackage = {
    CURRENT_VERSION: 4.2,
    ALLOWED_PROTOCOLS: ['http', 'https', 'socks4/5'],
    proxyList: [],
    prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
    stringBundle: null,
    proxyManager: null,
    onLoad: function (str) {
        this.stringBundle = str;

        if (this.isFirstRun()) {
            this.addIcon("nav-bar", "proxy-toolbar-button");
            this.addIcon("addon-bar", "proxy-toolbar-button");
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
        var self = this;
        this.parseProxyList(function (ip_addr) {
            var rand_proxy = self.randomProxy(ip_addr);
            self.proxyManager.start(rand_proxy[0], rand_proxy[1], rand_proxy[3]);
            self.controlIcon(true);
            self.proxyList = ip_addr;
            self.addItemsToProxyList();
        });
    },
    disable: function () {
        this.proxyManager.stop();
        this.controlIcon(false);
    },
    chooseProxy: function (event) {
        var proxy_list = document.getElementById('proxy-list-box');
        if (proxy_list) {
            var hbox_elements = proxy_list.childNodes;

            if (hbox_elements) {
                for (var i = 0; i < hbox_elements.length; i++) {
                    if (hbox_elements[i].className == 'active') {
                        var i_checkBox = hbox_elements[i].getElementsByClassName('checkbox-square');

                        if (i_checkBox.length) {
                            var this_class = i_checkBox[0].getAttribute('class');
                            if (this_class.indexOf('active') != -1) {
                                i_checkBox[0].setAttribute('class', this_class.substring(0, this_class.indexOf('active') - 1));
                            }
                        }

                        if (hbox_elements[i] == event.currentTarget) break;

                        hbox_elements[i].removeAttribute('class');
                        break;
                    }
                }
            }
        }

        if (!event.currentTarget.className.length) {
            event.currentTarget.setAttribute('class', 'active');
            var checkBox = event.currentTarget.getElementsByClassName('checkbox-square');

            if (checkBox.length) {
                checkBox[0].setAttribute('class', checkBox[0].getAttribute('class') + ' ' + 'active');
            }

            this.changeProxy();
        } else {
            event.currentTarget.removeAttribute('class');
            this.disable();
            this.controlIcon(false);
        }
    },
    changeProxy: function () {
        var hbox = document.getElementById('proxy-list-box').getElementsByTagName('hbox');

        for (var i = 0; i < hbox.length; i++) {
            if (hbox[i].className.length) {
                var hbox_child = hbox[i].getElementsByClassName('proxy-address');
                var proxy_type = hbox[i].getElementsByClassName('proxy-type');
                if (hbox_child.length && proxy_type.length) {
                    this.proxyManager.start(hbox_child[0].value, hbox_child[0].getAttribute('data-port'), proxy_type[0].textContent.toLowerCase());
                    this.controlIcon(true);
                }
                break;
            }
        }
    },
    refresh: function () {
        this.removeProxyList();
        var self = this;
        var proxyMessage = document.getElementById('proxy-message');
        this.parseProxyList(function (ip_addr) {
            self.proxyList = ip_addr;
            self.addItemsToProxyList();

            if (!ip_addr.length) {
                if (proxyMessage) {
                    proxyMessage.textContent = self.stringBundle.getString('didntRespond');
                    proxyMessage.style.display = 'block';
                }
            }
        });

        if (proxyMessage) proxyMessage.style.display = 'none';

        var doc_box = document.getElementById('proxy-list-box');

        if (doc_box) {
            var list_class = doc_box.getAttribute('class');
            if (list_class.indexOf('loading') == -1) {
                doc_box.setAttribute('class', list_class + ' ' + 'loading');
            }
        }
    },
    randomProxy: function (proxy) {
        return proxy[parseInt(Math.random() * proxy.length - 1)];
    },
    addItemsToProxyList: function () {
        for (var i = 0; i < this.proxyList.length; i++) {
            this.addProxyItem(this.proxyList[i][0], this.proxyList[i][1], this.proxyList[i][2], this.proxyList[i][3]);
        }
    },
    removeProxyList: function () {
        var proxy_list = document.getElementById('proxy-list-box');

        while (proxy_list.firstChild) {
            proxy_list.removeChild(proxy_list.firstChild);
        }
    },
    renderSettings: function () {
        var template_list = document.getElementById('templates-list');

        if (template_list) {
            if (!template_list.childNodes.length) {
                for (var i = 0; i < this.proxyManager.uriList.length; i++) {
                    if (this.proxyManager.uriList[i].length) {
                        this.addTemplate(this.proxyManager.uriList[i]);
                    }
                }
            }
        }
    },
    listPanelShown: function () {
        var proxyMessage = document.getElementById('proxy-message'),
            listNodes = document.getElementById('proxy-list-box');
        if (proxyMessage) {
            if (listNodes) {
                if (listNodes.childNodes.length) {
                    proxyMessage.style.display = 'none';
                }
            }
        }
    },
    removeTemplate: function (tmpl, uniqueId) {
        if (this.proxyManager.uriList.length) {
            var uriIndex = this.proxyManager.uriList.indexOf(tmpl);
            if (uriIndex != -1) {
                var unEl = document.getElementById(uniqueId);

                if (unEl) document.getElementById('templates-list').removeChild(unEl.parentNode);

                this.proxyManager.uriList.splice(uriIndex, 1);
                new FileReader().fileDescriptor().removeLine(tmpl);
            }
        }
    },
    validateTemplate: function () {
        var tmpl_input = document.getElementById('template-input');

        if (tmpl_input) {
            if (tmpl_input.value.length) {
                this.newTemplate(tmpl_input.value);

                tmpl_input.value = '';
            }
        }
    },
    enableTemplates: function (checkBox) {
        var checkBox_class = checkBox.getAttribute('class');
        if (checkBox_class.indexOf('active') != -1) {
            checkBox.setAttribute('class', checkBox_class.substring(0, checkBox_class.indexOf('active') - 1));
            this.proxyManager.templateEnabled = false;
        } else {
            checkBox.setAttribute('class', checkBox_class + ' ' + 'active');
            this.proxyManager.templateEnabled = true;
        }

        this.prefs.setBoolPref('extensions.firex.enableTemplates', this.proxyManager.templateEnabled);
    },
    newTemplate: function (tmpl) {
        new FileReader().fileDescriptor().write(tmpl, true);
        this.proxyManager.uriList.push(tmpl);
        this.addTemplate(tmpl);
    },
    parseProxyList: function (callback) {
        var req = new XMLHttpRequest();
        var __self = this;

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

                            if (__self.ALLOWED_PROTOCOLS.indexOf(proxyCondition.proxyType) == -1) continue;

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
                } else callback([]);

                var doc_box = document.getElementById('proxy-list-box');

                if (doc_box) {
                    var list_class = doc_box.getAttribute('class');
                    if (list_class.indexOf('loading') != -1) {
                        doc_box.setAttribute('class', list_class.substring(0, list_class.indexOf('loading') - 1));
                    }
                }
            }
        };
        req.send(null);
    },
    openList: function () {
        this.openPopup('proxy-list-panel');
    },
    openSettings: function () {
        this.openPopup('settings-panel');
    },
    openPopup: function (str_element) {
        var panel = document.getElementById(str_element);

        if (panel) {
            panel.openPopup(document.getElementById('proxy-toolbar-button'), 'after_end', 0, 0, false, false);
        }
    },
    isFirstRun: function () {
        var firstRun = this.prefs.getBoolPref('extensions.firex.firstRun');

        if (firstRun) {
            this.prefs.setBoolPref('extensions.firex.firstRun', false);
            this.prefs.setCharPref('extensions.firex.installedVersion', this.CURRENT_VERSION);
        } else {
            if (parseFloat(this.prefs.getCharPref('extensions.firex.installedVersion')) < this.CURRENT_VERSION) {
                this.prefs.setCharPref('extensions.firex.installedVersion', this.CURRENT_VERSION);
                return true;
            }
        }

        return firstRun;
    },
    addProxyItem: function (value, port, country, type) {
        var self = this;
        var xulNS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
        var hbox = document.createElementNS(xulNS, 'hbox');
        hbox.addEventListener('click', function (evt) {
            self.chooseProxy(evt);
        }, false);

        var checkbox = document.createElementNS('http://www.w3.org/1999/xhtml', 'html:div');
        checkbox.setAttribute('class', 'checkbox-square');

        var element = document.createElementNS(xulNS, 'label');
        element.setAttribute('class', 'proxy-address');
        element.setAttribute('value', value);
        element.setAttribute('data-port', port);

        var el_country = document.createElementNS(xulNS, 'label');
        el_country.textContent = country;
        el_country.setAttribute('class', 'proxy-country');

        var el_type = document.createElementNS(xulNS, 'label');
        el_type.textContent = type.toUpperCase();
        el_type.setAttribute('class', 'proxy-type');

        document.getElementById('proxy-list-box').appendChild(hbox);
        hbox.appendChild(checkbox);
        hbox.appendChild(element);
        hbox.appendChild(el_type);
        hbox.appendChild(el_country);
    },
    addTemplate: function (template) {
        var self = this;
        var w3c = 'http://www.w3.org/1999/xhtml';
        var settingsTemplate = document.createElementNS(w3c, 'html:div');
        settingsTemplate.setAttribute('class', 'settings-template');

        var wrap_template = document.createElementNS(w3c, 'html:div');
        wrap_template.style.float = 'left';
        wrap_template.setAttribute('class', 'list-style-arrow');

        var image_tmp = document.createElementNS(w3c, 'html:img');
        image_tmp.setAttribute('src', 'chrome://FireX/skin/icons/icon-remove.png');
        image_tmp.setAttribute('alt', 'rm');
        image_tmp.setAttribute('id', 'rm' + Math.random() * Math.pow(2, 31));

        image_tmp.addEventListener('click', function () {
            self.removeTemplate(template, this.getAttribute('id'));
        }, false);

        var textNode_tmp = document.createTextNode(template);

        wrap_template.appendChild(textNode_tmp);

        settingsTemplate.appendChild(wrap_template);
        settingsTemplate.appendChild(image_tmp);

        var template_list = document.getElementById('templates-list');
        if (template_list) {
            template_list.appendChild(settingsTemplate);
        }
    },
    controlIcon: function (hightlight) {
        hightlight = hightlight || false;
        var extensionButton = document.getElementById('proxy-toolbar-button');

        if (extensionButton) {
            var extensionButton_class = extensionButton.getAttribute('class'),
                extensionButton_index = extensionButton_class.indexOf('active');
            if (hightlight) {
                if (extensionButton_index == -1) extensionButton.setAttribute('class', extensionButton_class + ' ' + 'active');
            } else {
                if (extensionButton_index != -1) extensionButton.setAttribute('class', extensionButton_class.substring(0, extensionButton_index - 1));
            }
        }
    }
};

com.firexProxyPackage.proxyManager = new ProxyManager();
new FileReader().fileDescriptor().readAll(function (data) {
    if (data) {
        com.firexProxyPackage.proxyManager.uriList = data;
    }
});

window.addEventListener("load", function (e) {
    com.firexProxyPackage.onLoad(document.getElementById('firex-string-bundle'));
    var tmplEnable = document.getElementById('tmpl-enable');

    if (tmplEnable) {
        tmplEnable.addEventListener('click', function () {
            com.firexProxyPackage.enableTemplates(this);
        });

        if (com.firexProxyPackage.prefs.getBoolPref('extensions.firex.enableTemplates')) tmplEnable.click();
    }
}, false);