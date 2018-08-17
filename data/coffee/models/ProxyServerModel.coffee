class ProxyServerModel extends Backbone.Model
  messagePassing:
    'connect'    : 'connect'
    'disconnect' : 'disconnect'
    'toggle'     : 'toggle-favorite'

  initialize: ->
    @on 'change:favoriteState', () => @sync 'toggle', @

    @set 'pingClass', @getPingClass(@get 'pingTimeMs')

  toggle: ->
    @set 'activeState', !@get 'activeState'

    return @get 'activeState'

  getPingClass: (ping) ->
    if ping < 300 then return 'four-bars'
    else if ping < 1000 then return 'three-bars'
    else if ping < 3000 then return 'two-bars'
    else return 'one-bar'

  defaults: ->
    ipAddress     : null
    protocol      : null
    country       : null
    port          : null
    activeState   : false
    favoriteState : false
    pingTimeMs    : null
    isoCode       : null
