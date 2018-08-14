class Router extends Backbone.Router
  container: "#primary-content"

  routes: ->
    'blacklist' : 'blacklist'
    'proxies'   : 'index'
    '*actions'  : 'defaultRoute'

  initialize: ->
    @mCollection = new Menu
    @pCollection = new ProxyList
    @bCollection = new Patterns
    @proxyState  = new ProxyStateModel;
    @pattenState = new PatternStateModel;

    @createMenu()

  index: ->
    $(@container).html new ListView(collection: @pCollection, model: @proxyState).render().el

  blacklist: ->
    $(@container).html new PatternPageView(collection: @bCollection, model: @pattenState).render().el

  defaultRoute: ->
    this.navigate('proxies', true)

  createMenu: ->
    new MenuView
      collection: @mCollection

    @mCollection.add(
      new MenuEntryModel
        resource    : '#/proxies'
        icon        : 'list'
        placeholder : browser.i18n.getMessage "proxymenu"
        isActive    : true
    )

    @mCollection.add
      resource    : '#/blacklist'
      icon        : 'blacklist'
      placeholder : browser.i18n.getMessage "blacklist"
