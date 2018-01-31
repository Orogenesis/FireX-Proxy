class Router extends Backbone.Router
  container: "#primary-content"

  routes: ->
    'patterns': 'patterns'
    'favorite': 'favorite'
    '*actions': 'index'

  initialize: ->
    @mCollection = new Menu
    @pCollection = new ProxyList
    @bCollection = new Patterns

    @createMenu()

  index: ->
    $(@container).html new ListView(collection: @pCollection, model: new ProxyStateModel).render().el

  createMenu: ->
    new MenuView
      collection: @mCollection

    @mCollection.add(
      new MenuEntryModel
        resource    : ''
        icon        : 'list'
        placeholder : i18next.t "proxymenu"
        isActive    : true
    )