class ProxyList extends Backbone.Collection
  constructor: (options) ->
    super options

    @model = ProxyServerModel

  initialize: ->
    @url = '#/proxy-list'

    @proxyListPort = browser.runtime.connect(name: "get-proxy-list")

    @proxyListPort.onMessage.addListener(
      (message) =>
        @reset message
    )

    @on 'change:favoriteState', @changeFavorite

  fetch: (force, options) ->
    @proxyListPort.postMessage(name: 'get-proxy-list', force: force)

    return Backbone.Collection.prototype.fetch.call(this, options)

  comparator: (model) ->
    -1 * model.get 'activeState'

  changeFavorite: (model) ->
    browser.runtime.sendMessage(name: 'toggle-favorite', message: model.toJSON())