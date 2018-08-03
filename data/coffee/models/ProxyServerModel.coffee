class ProxyServerModel extends Backbone.Model
  messagePassing:
    'connect'    : 'connect'
    'disconnect' : 'disconnect'
    'toggle'     : 'toggle-favorite'

  initialize: ->
    @on 'change:favoriteState', () => @sync 'toggle', @

  toggle: ->
    @set 'activeState', !@get 'activeState'

    return @get 'activeState'

  defaults: ->
    ipAddress     : null
    protocol      : null
    country       : null
    port          : null
    activeState   : false
    favoriteState : false
    pingTimeMs    : null
