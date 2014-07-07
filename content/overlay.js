var FavimExtension = {

	prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
	stringBundle: null,
	alertsService: Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService),
	currentElement: null,

	toolbarClick: function() {
		FavimExtension.isUserLogged(function(res) {
			if($.isEmptyObject(res)) {
				/* Пользователь не авторизован на favim.com */
				FavimExtension.alertsService.showAlertNotification("chrome://Favim/skin/icon32.png", "Ошибка", "Вы не авторизованы на Favim.com.", false);
			}
			else {
				/* Пользователь авторизован на Favim.com, загружаем все изображение со страницы */
				var content_body = $(content.document.body),
					images = null;

				$(content.document).scrollTop(0);

				FavimExtension.addFavimToPage(content_body);

				content_body.find('img').each(function(i, val) {
					if(val.naturalWidth < 215 || val.naturalHeight < 185) {
						return true;
					}
					FavimExtension.addImageToFavimBar(content_body, val, val.naturalWidth, val.naturalHeight);
				});

				content_body.find('*[src]').not('img').each(function(i, val) {
					var image = new Image();
					image.src = $(val).attr('src');

					if(image.width < 215 || image.height < 185) {
						return true;
					}
					FavimExtension.addImageToFavimBar(content_body, val, image.width, image.height);
				});

				if(content_body.find('.favim-image').length == 1) {
					var image = new Image();
					image.src = content_body.find('.favim-image > img').attr('src');

					content_body.find('.favim-image').css({
						'background': 'url('+ $(image).attr('src') + ')',
						'background-position': 'center top'
					});

					content_body.find('.favim-image, .favim-add').css({
						width: image.width / 2,
						height: image.height / 2
					});

					content_body.find('.favim-size').css({
						width: image.width / 2
					});


					content_body.find('.favim-add-heart').css('left', '40%');

					content_body.find('.favim-image > img').css('display', 'none');
				}

				content_body.find("#favim-save").css({
					'height': content_body[0].scrollHeight
				});

				content_body.find('.favim-close').on('click', function(e) {
					content_body.find('#favim-save').remove();
				});

				content_body.find(".favim-image").on('click', function(e) {
					FavimExtension.uploadImage($(this).children(':first'));
				});
			}
		});
	},
	onLoad: function() {
		if(FavimExtension.isFirstRun()) {
			FavimExtension.addIcon("nav-bar", "favim-button");
			FavimExtension.addIcon("addon-bar", "favim-button");
		}
		var contextMenu = document.getElementById("contentAreaContextMenu");
		if(contextMenu) {
			contextMenu.addEventListener('popupshowing', function(e) {
				var contextFavim = document.getElementById("contextFavim");
				if($(document.popupNode).prop('tagName').toLowerCase() != 'img') {
					contextFavim.hidden = true;
					return;
				}
				contextFavim.hidden = false;
			});
		}
	},
	isFirstRun: function() {
		var firstRun = FavimExtension.prefs.getBoolPref('extensions.favim.firstRun'),
			currentVersion = 1.0;
		if(firstRun) {
			FavimExtension.prefs.setBoolPref('extensions.favim.firstRun', false);
			FavimExtension.prefs.setCharPref('extensions.favim.installedVersion', currentVersion);
		}

		if(parseFloat(FavimExtension.prefs.getCharPref('extensions.favim.installedVersion')) < currentVersion) {
			FavimExtension.prefs.setCharPref('extensions.favim.installedVersion', currentVersion.toString());

			return true;
		}

		return firstRun;
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
	getOffsetElement: function(element) {
		var top = 0, left = 0
	    while(element) {
			top = top + parseFloat(element.offsetTop)
			left = left + parseFloat(element.offsetLeft)
			element = element.offsetParent        
	    }

		return {
			top: Math.round(top), 
			left: Math.round(left)
		}
	},
	isUserLogged: function(callback) {
		$.ajax({
			url: 'http://favim.com/ext/getuser.php',
			cache: false,
			dataType: "json",
			success: function(data) {
				callback(data);
			}
		});
	},
	uploadImage: function(element) {
		var popup = 'http://favim.com/ext/getpopup/',
			current_src = $(element).attr('src');
		if(content.document.domain == 'favim.ru' || content.document.domain == 'favim.com') {
			FavimExtension.alertsService.showAlertNotification("chrome://Favim/skin/icon32.png", "Ошибка", "Невозможно загрузить изображения с самого сайта Favim.com.", false);
			return false;
		}
		FavimExtension.isUserLogged(function(res) {
			if($.isEmptyObject(res)) {
				/* Пользователь не авторизован на favim.com */
				FavimExtension.alertsService.showAlertNotification("chrome://Favim/skin/icon32.png", "Ошибка", "Вы не авторизованы на Favim.com.", false);
			}
			else {
				if(!current_src.match(/^[a-zа-я\-\_0-9\.]+\.[a-z]+|^https?\:\/\//i) && current_src.length < 256) {
					current_src = 'http://' + content.document.domain + current_src;
				}

				let top = ($(content.window).height() / 2) - (380 / 2),
					left = ($(content.window).width() / 2) - (590 / 2);

				window.open(popup + '?media='+ encodeURIComponent(current_src), "Favin.com", "width=590, height=380, top="+ top + ", left="+ left);
			}
		});
	},
	contextSave: function(e) {
		/* Сохраняем изображение при клике в контекстном меню */
		FavimExtension.uploadImage($(document.popupNode));
	},
	URLIsInvalid: function(url) {
		return url.match(/.+\.(jpg|jpeg|png|gif)$/i) ? false : true;
	},
	addFavimDragMenu: function(doc) {
		if(!doc.find('.fw-main').length) {
			doc.append('\
				<div class="fw-main">\
					<div class="fwsmall">\
						<div class="fwlogo">favim.com</div>\
						<div class="fwsmalltext">\
							Перетащите картинку\
							<br>\
							чтобы сохранить\
						</div>\
					</div>\
				</div>');

			doc.find(".fw-main").css({
				'top': $(content.window).height() / 2.5
			});

			doc.append('<style>@import "chrome://Favim/skin/overlay.css";</style>');
		}	
	},
	addFavimToPage: function(doc) {
		doc.append('<div id="favim-save">\
			<div class="favim-header">\
				<div class="favim-logo"></div>\
				<div class="favim-close"></div>\
			</div>\
			<div class="favim-body"></div>\
		</div>');
	},
	addImageToFavimBar: function(content, image, width, height) {
		content.find('#favim-save .favim-body').append('\
			<div class="favim-image">\
				<img src="'+ $(image).attr("src") +'" />\
				<div class="favim-size">\
					<div class="favim-text">\
						'+ width + 'x' + height +'\
					</div>\
				</div>\
				<div class="favim-add"></div>\
				<div class="favim-add-heart"></div>\
			</div>\
		');
	}

};

window.addEventListener("load", function load(e) {
	FavimExtension.onLoad();

	window.removeEventListener("load", load, false);

	if(gBrowser) {
	    gBrowser.addEventListener('DOMContentLoaded', function(event) {

	    	var doc = $(content.document.body),
	    		current_image = null;

	    	FavimExtension.addFavimDragMenu(doc);

	    	if(!doc.find("#favimImage").length) {
	    		doc.append('<div id="favimImage" style="background: url(chrome://Favim/skin/icon24.png); width: 24px; height: 24px; cursor: pointer; z-index: 999; position: absolute; top: 0; left: 0; display: none;"></div>')
	    	}
			doc.on('mouseover', "img", function(e) {
				if(content.document.domain == 'favim.ru' || content.document.domain == 'favim.com') {
					return false;
				}
				if(this.width < 215 || this.height < 185) {
					return false;
				}

				current_image = $(this);

				var offset = $(this).offset();
				doc.find("#favimImage").css({
					'left': offset.left + 10,
					'top': offset.top + 10,
					'display': 'block'
				});
			})
			doc.on('mouseout', "img", function(e) {
				if(doc.find("#favimImage")[0] === $(e.relatedTarget)[0]) {
					return false;
				}
				doc.find("#favimImage").css('display', 'none');
			});
			doc.unbind('click').on('click', "#favimImage", function(e) {
				$(this).css('display', 'none');

				FavimExtension.uploadImage(current_image);
			});

			/* drag & drop */

			doc.on('dragstart', function(e) {
				if($(e.target).is('img')) {
					doc.find(".fw-main").css('display', 'block');
					FavimExtension.currentElement = $(e.target);
				}
				else {
					var children = $(e.target).find('img');
					if(children.length) {
						doc.find(".fw-main").css('display', 'block');
						FavimExtension.currentElement = children;
					}
				}
			});
			doc.on('dragover', '.fw-main', function(e) {
				e.preventDefault();
			});
			doc.unbind('drop').on('drop', '.fw-main', function(e) {
				e.preventDefault();
				FavimExtension.uploadImage(FavimExtension.currentElement);
			});
			doc.on('dragend', function(e) {
				doc.find(".fw-main").css('display', 'none');
			});

			/* iframe */
			doc.find('iframe').load(function() {
				var iframe_body = $(this).contents().find('body');
		    	if(!$(this).contents().find("#favimImage").length) {
		    		iframe_body.append('<div id="favimImage" style="background: url(chrome://Favim/skin/icon24.png); width: 24px; height: 24px; cursor: pointer; z-index: 999; position: absolute; top: 0; left: 0; display: none;"></div>')
		    	}

				iframe_body.on('dragstart', function(e) {
					if($(e.target).is('img')) {
						doc.find(".fw-main").css('display', 'block');
						FavimExtension.currentElement = $(e.target);
					}
					else {
						var children = $(e.target).find('img');
						if(children.length) {
							doc.find(".fw-main").css('display', 'block');
							FavimExtension.currentElement = children;
						}
					}
				});
				iframe_body.on('dragend', function(e) {
					doc.find(".fw-main").css('display', 'none');
				});
				iframe_body.on('mouseover', "img", function(e) {
					if(content.document.domain == 'favim.ru' || content.document.domain == 'favim.com') {
						return false;
					}
					if(this.naturalWidth < 215 || this.naturalHeight < 185) {
						return false;
					}

					current_image = $(this);

					var offset = $(this).offset();
					iframe_body.find('#favimImage').css({
						'left': offset.left + 10,
						'top': offset.top + 10,
						'display': 'block'
					});
				})
				iframe_body.on('mouseout', "img", function(e) {
					if(iframe_body.find('#favimImage')[0] === $(e.relatedTarget)[0]) {
						return false;
					}
					iframe_body.find('#favimImage').css('display', 'none');
				});
				iframe_body.unbind('click').on('click', "#favimImage", function(e) {
					$(this).css('display', 'none');

					FavimExtension.uploadImage(current_image);
				});
			});
	    }, false);
	}
}, false);