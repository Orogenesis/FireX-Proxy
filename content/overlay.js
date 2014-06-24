var ProxyAddonBar = {

	proxyList: [],
	prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
	stringBundle: null,

	onLoad: function(str) {
		ProxyAddonBar.stringBundle = str;

		if(ProxyAddonBar.isFirstRun()) {
			/* icon */
			ProxyAddonBar.addIcon("nav-bar", "myextension-button");
			ProxyAddonBar.addIcon("addon-bar", "myextension-button");
			/* ip address */
			ProxyAddonBar.addIcon("nav-bar", "ip-address");
			ProxyAddonBar.addIcon("addon-bar", "ip-address");
		}	
	},
	addIcon: function(toolbarId, id) {
		if(!document.getElementById(id)) {
			var toolbar = document.getElementById(toolbarId);

			toolbar.insertItem(id, null);
			toolbar.setAttribute("currentset", toolbar.currentSet);

			document.persist(toolbar.id, "currentset");

			if(toolbarId == "addon-bar") {
				toolbar.collapsed = false;
			}
	    }
	},
	activate: function() {
		ProxyAddonBar.reset();
		ProxyAddonBar.parseProxyList(function(ip_addr) {
			var rand_proxy = ProxyAddonBar.randomProxy(ip_addr);
			if(rand_proxy[3] == 'http') {
				ProxyAddonBar.connectTo(rand_proxy);
			}
			else {
				ProxyAddonBar.connectToSSL(rand_proxy);
			}

			document.getElementById('ip-address').children[0].value = ProxyAddonBar.getIPAddress();

			ProxyAddonBar.proxyList = ip_addr;

			ProxyAddonBar.addItemsToProxyList();
		});
	},
	reset: function() {
		ProxyAddonBar.resetConfig();
		document.getElementById('ip-address').children[0].style.color = '#12B300';
		document.getElementById('ip-address').children[0].value = ProxyAddonBar.stringBundle.getString('proxyIsDisabled');
	},
	ping: function() {
		ProxyAddonBar.pingLogic(function(times) {
			document.getElementById('ip-address').children[0].value = ProxyAddonBar.getIPAddress() || ProxyAddonBar.stringBundle.getString('proxyIsDisabled');
			document.getElementById('ip-address').children[0].style.color = (times < 8) ? '#12B300' : '#B30000';
		});
	},
	chooseProxy: function(event) {
		if(!event.currentTarget.className.length) {
			event.currentTarget.setAttribute('class', 'active');
		}
		else {
			event.currentTarget.removeAttribute('class');
		}
	},
	changeProxy: function() {
		ProxyAddonBar.resetConfig();

		var hbox = document.getElementById('proxy-list-box').getElementsByTagName('hbox');
		for(var i = 0; i < hbox.length; i++) {
			if(hbox[i].className.length) {
				var hbox_child = hbox[i].children[0],
					proxy_type = hbox[i].getElementsByClassName('proxy-type')[0].innerHTML.toLowerCase();

				if(proxy_type == 'http') {
					ProxyAddonBar.connectTo([hbox_child.value, hbox_child.getAttribute('data-port')]);
				}
				else {
					ProxyAddonBar.connectToSSL([hbox_child.value, hbox_child.getAttribute('data-port')]);
				}

				document.getElementById('ip-address').children[0].value = ProxyAddonBar.getIPAddress();
				break;
			}
		}
	},
	refresh: function() {
		ProxyAddonBar.reset();
		ProxyAddonBar.parseProxyList(function(ip_addr) {
			ProxyAddonBar.proxyList = ip_addr;
			ProxyAddonBar.addItemsToProxyList();
		});
		Firebug.Console.log(document.getElementById('proxy-list-box'));
	},
	getIPAddress: function() {
		return ProxyAddonBar.prefs.getCharPref('network.proxy.http');
	},
	resetConfig: function() {
		ProxyAddonBar.prefs.clearUserPref('network.proxy.http');
		ProxyAddonBar.prefs.clearUserPref('network.proxy.http_port');
		ProxyAddonBar.prefs.clearUserPref('network.proxy.type');

		ProxyAddonBar.prefs.clearUserPref('network.proxy.ssl');
		ProxyAddonBar.prefs.clearUserPref('network.proxy.ssl_port');
	},
	connectTo: function(addr) {
		ProxyAddonBar.prefs.setCharPref('network.proxy.http', addr[0]);
		ProxyAddonBar.prefs.setIntPref('network.proxy.http_port', addr[1]);
		ProxyAddonBar.prefs.setIntPref('network.proxy.type', 1);
	},
	connectToSSL: function(addr) {
		ProxyAddonBar.prefs.setCharPref('network.proxy.http', addr[0]);
		ProxyAddonBar.prefs.setIntPref('network.proxy.http_port', addr[1]);

		ProxyAddonBar.prefs.setCharPref('network.proxy.ssl', addr[0]);
		ProxyAddonBar.prefs.setIntPref('network.proxy.ssl_port', addr[1]);
		ProxyAddonBar.prefs.setIntPref('network.proxy.type', 1);		
	},
	randomProxy: function(proxy) {
		return proxy[parseInt(Math.random() * proxy.length - 1)];
	},
	pingLogic: function(callback) {
		var req = new XMLHttpRequest(),
			win = window.open("chrome://FireX/content/loading.xul", "", "chrome");
			pinged = 0,
			isCompleted = false;

		win.onload = function() {
			win.document.getElementById('loading_description').value = ProxyAddonBar.stringBundle.getString('waitCheckSpeed');
		}

		var	interval = setInterval(function() {
			win.document.getElementById('loading_description').value = ProxyAddonBar.stringBundle.getString('doneSeconds') + ': ' + parseInt(8 - pinged) + ' ' + ProxyAddonBar.stringBundle.getString('seconds');

			if(pinged >= 8) {
				win.close();
				clearInterval(interval);

				isCompleted = true;

				callback(pinged);
				return false;
			}

			pinged++;
			
		}, 1000);

		req.open('GET', 'http://www.mozilla.org/', true);
		req.onreadystatechange = function() {
			if(req.readyState == 4) {
				win.close();
				clearInterval(interval);
				if(!isCompleted) {
					callback(pinged);
				}
			}
		}
		req.send(null);
	},
	addItemsToProxyList: function() {
		var no_addr = document.getElementById('no_addresses');
		if(no_addr) {
			document.getElementById('proxy-list-box').removeChild(no_addr);
		}

		var proxy_list = document.getElementById('proxy-list-box');

		while(proxy_list.firstChild) {
			proxy_list.removeChild(proxy_list.firstChild);
		}

		for(var i = 0; i < ProxyAddonBar.proxyList.length; i++) {
			ProxyAddonBar.addProxyItem(ProxyAddonBar.proxyList[i][0], ProxyAddonBar.proxyList[i][1], ProxyAddonBar.proxyList[i][2], ProxyAddonBar.proxyList[i][3]);
		}
	},
	addProxyItem: function(value, port, country, type) {
		var xulNS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
			hbox = document.createElementNS(xulNS, 'hbox');
			element = document.createElementNS(xulNS, 'label'),
			el_country = document.createElementNS(xulNS, 'label'),
			el_type = document.createElementNS(xulNS, 'label');

		element.setAttribute('value', value);
		element.setAttribute('data-port', port);

		hbox.addEventListener('click', function(e) {
			ProxyAddonBar.chooseProxy(e);
		}, false);

		el_country.textContent = country;
		el_country.setAttribute('class', 'proxy-country');

		el_type.textContent = type.toUpperCase();
		el_type.setAttribute('class', 'proxy-type');

		document.getElementById('proxy-list-box').appendChild(hbox);
		hbox.appendChild(element);
		hbox.appendChild(el_type);
		hbox.appendChild(el_country);
	},
	parseProxyList: function(callback) {
		var req = new XMLHttpRequest();
		req.open('GET', 'http://proxylist.hidemyass.com/', true);

		var win = window.open("chrome://FireX/content/loading.xul", "", "chrome");

		req.onreadystatechange = function() {
			if(req.readyState == 4) {
				if(req.status == 200) {

					var response = req.responseText,
						parser = new DOMParser(),
						doc = parser.parseFromString(response, "text/html"),
						doc_table = doc.getElementById("listable"),
						doc_tr = doc_table.getElementsByTagName('tbody')[0].getElementsByTagName('tr'),
						ip_addr = [];

					for(var i = 0; i < doc_tr.length; i++) {
						var doc_td = [
								doc_tr[i].getElementsByTagName('td')[1], 
								doc_tr[i].getElementsByTagName('td')[2], 
								doc_tr[i].getElementsByTagName('td')[4], 
								doc_tr[i].getElementsByTagName('td')[5], 
								doc_tr[i].getElementsByTagName('td')[3],
								doc_tr[i].getElementsByTagName('td')[6],
							],
							span = doc_td[0].getElementsByTagName('span')[0],
							loopAddr = '',
							proxySpeed = doc_td[2].getElementsByClassName('progress-indicator')[0].children[0].style.width,
							connectionTime = doc_td[3].getElementsByClassName('progress-indicator')[0].children[0].style.width,
							country = doc_td[4].getElementsByTagName('span')[0].textContent,
							proxy_type = doc_td[5].innerHTML.toLowerCase();

						if(connectionTime < parseInt(connectionTime) || parseInt(proxySpeed) < 40) {
							continue;
						}

						if(proxy_type != 'http' && proxy_type != 'https') {
							continue;
						}

						var match = span.getElementsByTagName('style')[0].innerHTML.match(/([^\n|.]+display:(?!none))/g),
							allElements = span.childNodes;

						for(var b = 0; b < allElements.length; b++) {
							var this_span = allElements[b],
								isLoop = false;

							if(this_span.textContent.length && this_span.tagName == undefined) {
								loopAddr += (loopAddr.length) ? '.' + this_span.textContent : this_span.textContent;
								continue;
							}

							if(this_span.style.display == "none") {
								continue;
							}

							if(this_span.tagName.toLowerCase() == 'style') {
								continue;
							}

							if(this_span.className.length) {
								for(var r = 0; r < match.length; r++) {
									if(match[r].replace(/{.*/, '') == this_span.className) {
										isLoop = true;
										break;
									}
								}
							}

							if(!this_span.innerHTML.length || this_span.innerHTML === '.') {
								continue;
							}

							if(!this_span.className.match(/^[0-9]+$/) && !isLoop && !this_span.style.display) {
								continue;
							}

							loopAddr += (loopAddr.length) ? '.' + this_span.innerHTML : this_span.innerHTML;
						}

						ip_addr.push([
							loopAddr.replace(/\.{2,}/g, '.'), doc_td[1].innerHTML, country, proxy_type
						]);
					}

					win.close();

					callback(ip_addr);
				}
			}
		}
		req.send(null);
	},
	isFirstRun: function() {
		var firstRun = ProxyAddonBar.prefs.getBoolPref('extensions.firex.firstRun'),
			currentVersion = 3.3;
		if(firstRun) {
			ProxyAddonBar.prefs.setBoolPref('extensions.firex.firstRun', false);
			ProxyAddonBar.prefs.setCharPref('extensions.firex.installedVersion', currentVersion);
		}

		if(parseFloat(ProxyAddonBar.prefs.getCharPref('extensions.firex.installedVersion')) < currentVersion) {
			ProxyAddonBar.prefs.setCharPref('extensions.firex.installedVersion', currentVersion.toString());

			return true;
		}

		return firstRun;
	}
};

window.addEventListener("load", function(e) {
	setTimeout(function() {

		ProxyAddonBar.onLoad(document.getElementById('firex-string-bundle'));
				
		document.getElementById('ip-address').children[0].value = ProxyAddonBar.getIPAddress() || ProxyAddonBar.stringBundle.getString('proxyIsDisabled');
	}, 5000);
}, false);