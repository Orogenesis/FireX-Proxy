if (!com) var com = {};
if (!com.firexProxyPackage) com.firexProxyPackage = {};

com.firexProxyPackage = {
    CURRENT_VERSION: 4.3,
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

        if (proxyMessage) {
            proxyMessage.style.display = 'none';
        }

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
        var proxyMessage = document.getElementById('proxy-message');
        var listNodes = document.getElementById('proxy-list-box');

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

                if (unEl !== null) {
                    document.getElementById('templates-list').removeChild(unEl.parentNode);
                }

                this.proxyManager.uriList.splice(uriIndex, 1);

                (new FileReader()).fileDescriptor().removeLine(tmpl);
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
        var __request = new XMLHttpRequest();
        var __regExp = /(\.([\da-z\-\_]+).display\:none)/gi;
        var __tableData = {
            ipIndex: 1,
            portIndex: 2,
            locationIndex: 3,
            protocolIndex: 6
        };

        __request.open('GET', 'http://proxylist.hidemyass.com/search-1304002', true);
        __request.onreadystatechange = function () {
            if (__request.readyState == XMLHttpRequest.DONE) {
                if (__request.status == 200) {
                    var __document = (new DOMParser()).parseFromString(__request.responseText, "text/html");
                    var __table = __document.getElementById("listable");
                    var __list = [];

                    if (__table != undefined) {
                        var __tr = __table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

                        for (var i = 0; i < __tr.length; i++) {
                            var matched = [];
                            var hidden = [];
                            var address = [];

                            var nodes = __tr[i].children;
                            var ipNode = nodes[__tableData.ipIndex].firstElementChild;
                            var hideStyles = ipNode.getElementsByTagName('style')[0].textContent;

                            while ((matched = __regExp.exec(hideStyles)) !== null) {
                                hidden.push(matched[2]);
                            }

                            var __childs = ipNode.childNodes;

                            for (var j = 0; j < __childs.length; j++) {
                                var __byte = parseFloat(__childs[j].textContent.trim());

                                if (!isNaN(__byte) && (__byte % 1) !== 0) {
                                    __byte *= (Math.pow(10, __byte.toString().length - 2));
                                    __byte = ~~__byte;
                                }

                                if (__childs[j].nodeType == Node.TEXT_NODE) {
                                    address.push(__byte);
                                } else if (__childs[j].style.display != 'none' && hidden.indexOf(__childs[j].className) == -1) {
                                    if (__childs[j].tagName.toLowerCase() == 'span') {
                                        address.push(__byte);
                                    }
                                }
                            }

                            var __ipAsString = address.filter(function (n) {
                                return !(n % 1) && !isNaN(n) && isFinite(n);
                            }).join('.');

                            __list.push([
                                __ipAsString,
                                nodes[__tableData.portIndex].textContent.trim(),
                                nodes[__tableData.locationIndex].textContent.trim(),
                                nodes[__tableData.protocolIndex].textContent.trim()
                            ]);
                        }
                    }

                    callback(__list);
                } else {
                    callback([]);
                }

                var __box = document.getElementById('proxy-list-box');

                if (__box) {
                    var list_class = __box.getAttribute('class');

                    if (list_class.indexOf('loading') != -1) {
                        __box.setAttribute('class', list_class.substring(0, list_class.indexOf('loading') - 1));
                    }
                }
            }
        };

        __request.send(null);
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

        if (extensionButton !== null) {
            var extensionButton_class = extensionButton.getAttribute('class');
            var extensionButton_index = extensionButton_class.indexOf('active');

            if (hightlight) {
                if (extensionButton_index == -1) {
                    extensionButton.setAttribute('class', extensionButton_class + ' ' + 'active');
                }
            } else {
                if (extensionButton_index != -1) {
                    extensionButton.setAttribute('class', extensionButton_class.substring(0, extensionButton_index - 1));
                }
            }
        }
    }
};

com.firexProxyPackage.proxyManager = new ProxyManager();
(new FileReader()).fileDescriptor().readAll(function (data) {
    if (data) {
        com.firexProxyPackage.proxyManager.uriList = data;
    }
});

window.addEventListener("load", function (e) {
    com.firexProxyPackage.onLoad(document.getElementById('firex-string-bundle'));
    var tmplEnable = document.getElementById('tmpl-enable');

    if (tmplEnable !== null) {
        tmplEnable.addEventListener('click', function () {
            com.firexProxyPackage.enableTemplates(this);
        });

        if (com.firexProxyPackage.prefs.getBoolPref('extensions.firex.enableTemplates')) {
            tmplEnable.click();
        }
    }
}, false);