class PatternStateModel extends Backbone.Model
  messagePassing:
    'read'   : 'get-blacklist-settings'
    'create' : 'change-blacklist-settings'

  defaults: ->
    isBlacklistEnabled: false
