class Router extends Backbone.Router
  container: "#primary-content"

  routes: ->
    'blacklist' : 'blacklist'
    'favorite'  : 'favorite'
    '*actions'  : 'index'

  initialize: ->
    @mCollection = new Menu
    @pCollection = new ProxyList
    @bCollection = new Patterns

    @createMenu()

  index: ->
    $(@container).html new ListView(collection: @pCollection, model: new ProxyStateModel).render().el

  blacklist: ->
    $(@container).html new PatternPageView(collection: @bCollection, model: new PatternStateModel).render().el

  createMenu: ->
    new MenuView
      collection: @mCollection

    @mCollection.add(
      new MenuEntryModel
        resource    : ''
        icon        : 'list'
        placeholder : browser.i18n.getMessage "proxymenu"
        isActive    : true
    )

    @mCollection.add
      resource    : '#/blacklist'
      icon        : 'blacklist'
      placeholder : browser.i18n.getMessage "blacklist"
