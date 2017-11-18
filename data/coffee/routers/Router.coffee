class Router extends Backbone.Router
  container: "#primary-content"

  routes: ->
    'index'    : 'index',
    'patterns' : 'patterns',
    'favorite' : 'favorite'
    
  initialize: ->
    @mCollection = new Menu
    @pCollection = new ProxyList
    @bCollection = new Patterns

    @createMenu()
    @index()
    
  index: ->
    $(@container).html new ListView(collection: @pCollection, model: new ProxyStateModel).render().el

  createMenu: ->
    new MenuView
      collection: @mCollection

    @mCollection.create
      resource    : '#/index'
      icon        : 'list'
      placeholder : i18next.t "proxymenu"
      isActive    : true