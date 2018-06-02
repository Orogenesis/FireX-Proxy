class Patterns extends Backbone.Collection
  messagePassing:
    'read': 'get-blacklist'

  constructor: (options) ->
    super options

    @model = PatternModel

  parse: (patterns) ->
    a = []

    _(patterns).each (isEnabled, pattern) ->
      a.push {
        address   : pattern,
        isEnabled : isEnabled
      }

    return a
