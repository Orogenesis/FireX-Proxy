class Patterns extends Backbone.Collection
  constructor: (options) ->
    super options

    @model = PatternModel

  initialize: ->
    @iCounter = 0
    @port     = 'blacklist'