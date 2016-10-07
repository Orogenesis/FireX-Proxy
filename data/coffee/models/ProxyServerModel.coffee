class ProxyServerModel extends Backbone.Model
  initialize: ->
    @port = 'favorite'

  toggle: ->
    @set 'activeState', !@get 'activeState'
    @get 'activeState'

  defaults: ->
    ipAddress         : null
    originalProtocol  : null
    country           : null
    port              : null
    activeState       : false
    favoriteState     : false