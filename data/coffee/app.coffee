$ ->
  _.extend Backbone.View,
    initialize: ->
      $('select')
        .select2()

  _.extend Backbone.Validation.callbacks,
    valid: (view) ->
      view
        .$el
        .find('.validation-state')
        .removeClass('failure')
        .addClass('done')
    invalid: (view) ->
      view
        .$el
        .find('.validation-state')
        .removeClass('done')
        .addClass('failure')

  i18next.init
    lng: browser.i18n.getUILanguage()
    resources:
      en:
        translation:
          "blacklist": "Blacklist"
          "favorites": "Favorites"
          "proxymenu": "Proxy list"
      ru:
        translation:
          "blacklist": "Чёрный список"
          "favorites": "Избранное"
          "proxymenu": "Список прокси"
      be:
        translation:
          "blacklist": "Чорны спис"
          "favorites": "Абранае"
          "proxymenu": "Списак прокси"
      uk:
        translation:
          "blacklist": "Чорний список"
          "favorites": "Показати обране"
          "proxymenu": "Список проксі"
      fr:
        translation:
          "blacklist": "La liste noire"
          "favorites": "Les favoris"
          "proxymenu": "La liste de proxies"
      de:
        translation:
          "blacklist": "Schwarze Liste"
          "favorites": "Favoriten anzeigen"
          "proxymenu": "Liste der Proxy"
  , () ->
    new Router()

    Backbone.history.start()