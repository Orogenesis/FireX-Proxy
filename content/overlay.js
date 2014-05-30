var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

function Addon() {
	this.initialized = true;
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
Addon.prototype.parseProxyList = function(callback) {
	var req = new XMLHttpRequest();  
	req.open('GET', 'http://free-proxy-list.net/', true);

	var win = window.open("chrome://FireX/content/loading.xul", "", "chrome");

	req.onreadystatechange = function() {
		if(req.readyState == 4) {
			if(req.status == 200) {
				var response = req.responseText,
					parser = new DOMParser(),
					doc = parser.parseFromString(response, "text/html"),
					doc_table = doc.getElementById('proxylisttable'),
					doc_tr =  doc_table.getElementsByTagName('tr'),
					ip_addr = [];

				for(var i = 1; i < doc_tr.length - 1; i++) {
					ip_addr.push([
						doc_tr[i].getElementsByTagName('td')[0].innerHTML,
						doc_tr[i].getElementsByTagName('td')[1].innerHTML
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
		win.document.getElementById('loading_description').innerHTML = 'Подождите, измеряем скорость соединения...';
	}

	var	interval = setInterval(function() {
		win.document.getElementById('loading_description').innerHTML = 'Осталось: ' + parseInt(8 - pinged) + ' сек.';

		if(pinged >= 8) {
			win.close();
			clearInterval(interval);

			isCompleted = true;

			callback(pinged);
			return false;
		}

		pinged++;
		
	}, 1000);

	req.open('GET', 'http://google.com/', true);
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
		obj.parseProxyList(function(ip_addr) {
			obj.connectTo(obj.randomProxy(ip_addr));

			document.getElementById('ip-address').innerHTML = obj.getIPAddress();
		});
	},
	reset: function() {
		obj.resetConfig();

		document.getElementById('ip-address').style.color = '#12B300';
		document.getElementById('ip-address').innerHTML = 'Прокси отключен';
	},
	ping: function() {
		obj.ping(function(times) {
			document.getElementById('ip-address').innerHTML = obj.getIPAddress() || 'Прокси отключен';
			document.getElementById('ip-address').style.color = (times < 8) ? '#12B300' : '#B30000';
		});
	}
};

window.addEventListener("load", function(e) {
	setTimeout(function() {
		document.getElementById('ip-address').innerHTML = obj.getIPAddress() || 'Прокси отключен';

		AddonBar.addIcon("nav-bar", "BrowserToolbarPalette");
		AddonBar.addIcon("addon-bar", "BrowserToolbarPalette");
	}, 5000);
}, false);