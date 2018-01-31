$ ->
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

  Handlebars.registerHelper 't', (key) -> new Handlebars.SafeString i18next.t key

  i18next.init
    lng: browser.i18n.getUILanguage()
    resources:
      en:
        translation:
          "blacklist"     : "Blacklist"
          "favorites"     : "Favorites"
          "proxymenu"     : "Proxy list"
          "country"       : "Country"
          "no-proxy"      : "No proxies available. Try to"
          "reset-filters" : "reset filters"
      ru:
        translation:
          "blacklist"     : "Чёрный список"
          "favorites"     : "Избранное"
          "proxymenu"     : "Список прокси"
          "country"       : "Страна"
          "no-proxy"      : "Прокси не найдены. Попробуйте"
          "reset-filters" : "сбросить фильтры"
      be:
        translation:
          "blacklist"     : "Чорны спис"
          "favorites"     : "Абранае"
          "proxymenu"     : "Списак прокси"
          "country"       : "Краіна"
          "no-proxy"      : "Проксі ня знойдзеныя. Паспрабуйце"
          "reset-filters" : "скінуць фільтры"
      uk:
        translation:
          "blacklist"     : "Чорний список"
          "favorites"     : "Показати обране"
          "proxymenu"     : "Список проксі"
          "country"       : "Країна"
          "no-proxy"      : "Проксі не знайдені. Спробуйте"
          "reset-filters" : "скинути фільтри"
      fr:
        translation:
          "blacklist"     : "La liste noire"
          "favorites"     : "Les favoris"
          "proxymenu"     : "La liste de proxies"
          "country"       : "Pays"
          "no-proxy"      : "Aucun proxy disponible. Essayez de"
          "reset-filters" : "réinitialiser les filtres"
      de:
        translation:
          "blacklist"     : "Schwarze Liste"
          "favorites"     : "Favoriten anzeigen"
          "proxymenu"     : "Liste der Proxy"
          "country"       : "Land"
          "no-proxy"      : "Keine proxies verfügbar. Probieren sie es jetzt"
          "reset-filters" : "filter zurücksetzen"
  , () ->
    new Router()

    Backbone.history.start()