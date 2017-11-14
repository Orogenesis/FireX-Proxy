class ProxyView extends Backbone.View
  events: ->
    'click'           : 'toggleActive'
    'click .checkbox' : 'add'

  tagName: ->
    'tr'

  initialize: ->
    @template = _.template $('#server-template').html()

    @listenTo @model, 'change', @render
    @listenTo @model, 'destroy', @remove

  render: ->
    $(@el).html(@template @model.toJSON()).toggleClass 'active', @model.get 'activeState'

    @$favoriteCheckbox = @$('.checkbox')
    @$favoriteCheckbox.toggleClass 'active', @model.get 'favoriteState'

    return @

  toggleActive: ->
    if @model.toggle()
      browser.runtime.sendMessage(name: 'connect', message: @model.toJSON())
    else
      browser.runtime.sendMessage(name: 'disconnect')

  add: ->
    @model.set 'favoriteState', !@model.get 'favoriteState'

    return false