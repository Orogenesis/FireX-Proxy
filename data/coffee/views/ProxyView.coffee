class ProxyView extends Backbone.View
  events: ->
    'click': 'toggleActive'
    'click .checkbox-square': 'add'

  tagName: ->
    'tr'

  initialize: ->
    @template = _.template $('#server-template').html()

    @listenTo @model, 'change', @render
    @listenTo @model, 'destroy', @remove

  render: ->
    $(@el).html(@template @model.toJSON()).toggleClass 'active', @model.get 'activeState'

    @$favoriteCheckbox = @$ '.checkbox-square'
    @$favoriteCheckbox.toggleClass 'active', @model.get 'favoriteState'

    return @

  toggleActive: ->
    if @model.toggle()
      addon.port.emit 'connect', @model.toJSON()
    else
      addon.port.emit 'disconnect'

  add: ->
    @model.set 'favoriteState', !@model.get 'favoriteState'

    return false