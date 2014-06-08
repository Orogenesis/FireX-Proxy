var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
	stringBundle = null;

function Addon() {
	this.proxyList = [];
}
Addon.prototype.install = function(id) {
	var toolbar = document.getElementById('addon-bar');

	toolbar.insertItem(id, null);
}
Addon.prototype.randomProxy = function(proxy) {
	return proxy[parseInt(Math.random() * proxy.length - 1)];
}
Addon.prototype.connectTo = function(addr) {
	prefs.setCharPref('network.proxy.http', addr[0]);
	prefs.setIntPref('network.proxy.http_port', addr[1]);
	prefs.setIntPref('network.proxy.type', 1);
}
Addon.prototype.resetConfig = function() {
	prefs.clearUserPref('network.proxy.http');
	prefs.clearUserPref('network.proxy.http_port');
	prefs.clearUserPref('network.proxy.type');
}
Addon.prototype.getIPAddress = function() {
	return prefs.getCharPref('network.proxy.http');
}
/* HideMyAss crawler (spider) */
Addon.prototype.parseProxyList = function(callback) {
	var req = new XMLHttpRequest();  
	req.open('GET', 'http://hidemyass.com/proxy-list/', true);

	var win = window.open("chrome://FireX/content/loading.xul", "", "chrome");

	req.onreadystatechange = function() {
		if(req.readyState == 4) {
			if(req.status == 200) {

				var response = req.responseText,
					parser = new DOMParser(),
					doc = parser.parseFromString(response, "text/html"),
					doc_table = doc.getElementById("listtable"),
					doc_tr = doc_table.getElementsByTagName('tbody')[0].getElementsByTagName('tr'),
					ip_addr = [];

				for(var i = 0; i < doc_tr.length; i++) {
					var doc_td = [
							doc_tr[i].getElementsByTagName('td')[1], doc_tr[i].getElementsByTagName('td')[2], doc_tr[i].getElementsByTagName('td')[4], doc_tr[i].getElementsByTagName('td')[5], doc_tr[i].getElementsByTagName('td')[3]
						],
						span = doc_td[0].getElementsByTagName('span')[0],
						loopAddr = '',
						proxySpeed = doc_td[2].getElementsByClassName('speedbar')[0].children[0].className,
						connectionTime = doc_td[3].getElementsByClassName('speedbar')[0].children[0].className,
						country = doc_td[4].getElementsByTagName('span')[0].textContent;

					if(connectionTime !== 'fast' || (proxySpeed != 'fast' && proxySpeed != 'medium')) {
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
						loopAddr.replace(/\.{2,}/g, '.'), doc_td[1].innerHTML, country
					]);
				}

				win.close();

				callback(ip_addr);
			}
		}
	}
	req.send(null);
}
Addon.prototype.ping = function(callback) {
	var req = new XMLHttpRequest(),
		win = window.open("chrome://FireX/content/loading.xul", "", "chrome");
		pinged = 0,
		isCompleted = false;

	win.onload = function() {
		win.document.getElementById('loading_description').value = stringBundle.getString('waitCheckSpeed');
	}

	var	interval = setInterval(function() {
		win.document.getElementById('loading_description').value = stringBundle.getString('doneSeconds') + ': ' + parseInt(8 - pinged) + ' ' + stringBundle.getString('seconds');

		if(pinged >= 8) {
			win.close();
			clearInterval(interval);

			isCompleted = true;

			callback(pinged);
			return false;
		}

		pinged++;
		
	}, 1000);

	req.open('GET', 'http://www.rockstargames.com/', true);
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
}
Addon.prototype.addProxyItem = function(value, port, country) {
	var xulNS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
		hbox = document.createElementNS(xulNS, 'hbox');
		element = document.createElementNS(xulNS, 'label'),
		el_country = document.createElementNS(xulNS, 'label');

	element.setAttribute('value', value);
	element.setAttribute('data-port', port);

	hbox.setAttribute('onclick', 'AddonBar.chooseProxy(event);');
	el_country.textContent = country;

	document.getElementsByClassName('proxy-list')[0].appendChild(hbox);
	hbox.appendChild(element);
	hbox.appendChild(el_country);
}
Addon.prototype.addItemsToProxyList = function() {
	var no_addr = document.getElementById('no_addresses');
	if(no_addr) {
		document.getElementsByClassName('proxy-list')[0].removeChild(no_addr);
	}

	var proxy_list = document.getElementsByClassName('proxy-list');

	while(proxy_list.firstChild) {
		proxy_list.removeChild(proxy_list.firstChild);
	}

	for(var i = 0; i < this.proxyList.length; i++) {
		this.addProxyItem(this.proxyList[i][0], this.proxyList[i][1], this.proxyList[i][2]);
	}
}

var obj = new Addon();

var AddonBar = {
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
		AddonBar.reset();
		obj.parseProxyList(function(ip_addr) {
			obj.connectTo(obj.randomProxy(ip_addr));

			document.getElementById('ip-address').value = obj.getIPAddress();

			obj.proxyList = ip_addr;

			obj.addItemsToProxyList();
		});
	},
	reset: function() {
		obj.resetConfig();

		document.getElementById('ip-address').style.color = '#12B300';
		document.getElementById('ip-address').value = stringBundle.getString('proxyIsDisabled');
	},
	ping: function() {
		obj.ping(function(times) {
			document.getElementById('ip-address').value = obj.getIPAddress() || stringBundle.getString('proxyIsDisabled');
			document.getElementById('ip-address').style.color = (times < 8) ? '#12B300' : '#B30000';
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
		var hbox = document.getElementsByClassName('proxy-list')[0].getElementsByTagName('hbox');
		for(var i = 0; i < hbox.length; i++) {
			if(hbox[i].className.length) {
				var hbox_child = hbox[i].children[0];
				obj.connectTo([hbox_child.value, hbox_child.getAttribute('data-port')]);

				document.getElementById('ip-address').value = obj.getIPAddress();
				break;
			}
		}
	},
	refresh: function() {
		obj.parseProxyList(function(ip_addr) {
			obj.proxyList = ip_addr;
			obj.addItemsToProxyList();
		});
	}
};

window.addEventListener("load", function(e) {
	setTimeout(function() {
		/* icon */
		AddonBar.addIcon("nav-bar", "myextension-button");
		AddonBar.addIcon("addon-bar", "myextension-button");
		/* ip address */
		AddonBar.addIcon("nav-bar", "ip-address");
		AddonBar.addIcon("addon-bar", "ip-address");

		stringBundle = document.getElementById('string-bundle');
				
		document.getElementById('ip-address').value = obj.getIPAddress() || stringBundle.getString('proxyIsDisabled');
	}, 5000);
}, false);