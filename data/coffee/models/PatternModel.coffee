class PatternModel extends Backbone.Model
  idAttribute: 'address'

  defaults: ->
    address   : null
    isEnabled : true

  validation: ->
    address:
      required: true

  messagePassing:
    'update': 'add-blacklist'
    'delete': 'remove-blacklist'
