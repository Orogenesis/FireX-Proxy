class ProxyList extends Backbone.Collection
  messagePassing:
    'read': 'get-proxy-list'

  constructor: (options) ->
    super options

    @model = ProxyServerModel

  comparator: (model) ->
    -1 * model.get 'activeState'

  byProtocol: (protos) ->
    new ProxyList @filter (model) => protos[model.get 'protocol']

  byFavorite: (favoriteState) ->
    new ProxyList @filter (model) => model.get('favoriteState') == favoriteState

  byCountry: (countries) ->
    new ProxyList @filter (model) => _.contains(countries, model.get('country')) || _.size(countries) == 0

  getProtocols: ->
    _.uniq @pluck 'protocol'
