class ProxyList extends Backbone.Collection
  constructor: (options) ->
    super options

    @model = ProxyServerModel

  initialize: ->
    @port = 'favorite'