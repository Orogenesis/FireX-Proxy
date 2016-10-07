class Router extends Backbone.Router
  routes: ->
    'index'    : 'index',
    'patterns' : 'patterns',
    'favorite' : 'favorite'
    
  initialize: ->
    @mCollection = new Menu
    @pCollection = new ProxyList
    @bCollection = new Patterns

    @content = $('#primary-content')

    patternStateModel = new PatternStateModel
    proxyStateModel   = new ProxyStateModel

    @menuView = new MenuView
      collection: @mCollection

    @listView = new ListView
      collection: @pCollection
      model: proxyStateModel

    @patternView = new PatternPageView
      collection: @bCollection
      model: patternStateModel

    @createMenu()
    @index()
    
  index: ->
    @content.html @listView.render().el

  patterns: ->
    @content.html @patternView.render().el
    
  createMenu: ->
    @mCollection.create
      iTo     : '#/index'
      iIcon   : 'list'
      iText   : l10n.t "proxymenu", _: "Proxy list"
      iActive : true

    @mCollection.create
      iTo     : '#/patterns'
      iIcon   : 'settings'
      iText   : l10n.t "blacklist", _: "Blacklist"