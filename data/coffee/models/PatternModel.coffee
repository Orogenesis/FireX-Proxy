class PatternModel extends Backbone.Model
  validation:
    address:
      pattern  : 'url'
      required : true

  initialize: ->
    @port = 'blacklist'

  toggleEditing: ->
    @set 'editingState', !@isEditing()

  isEditing: ->
    @get 'editingState'

  defaults: ->
    address      : null
    editingState : false