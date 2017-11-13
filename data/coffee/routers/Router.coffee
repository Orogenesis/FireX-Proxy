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

    @menuView = new MenuView
      collection: @mCollection

    @listView = new ListView
      collection: @pCollection
      model: new ProxyStateModel

    @patternView = new PatternPageView
      collection: @bCollection
      model: new PatternStateModel

    @createMenu()
    @index()
    
  index: ->
    @content.html @listView.render().el

  patterns: ->
    @content.html @patternView.render().el
    
  createMenu: ->
    @mCollection.create
      resource    : '#/index'
      icon        : 'list'
      placeholder : i18next.t "proxymenu"
      isActive    : true