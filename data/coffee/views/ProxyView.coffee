class ProxyView extends Backbone.View
  events: ->
    'click'           : 'toggleActive'
    'click .checkbox' : 'add'

  tagName: ->
    'tr'

  initialize: ->
    @listenTo @model, 'change', @render
    @listenTo @model, 'destroy', @remove

    @template = Handlebars.templates['proxyElement']

  render: ->
    $(@el).html(@template @model.toJSON()).toggleClass 'active', @model.get 'activeState'

    @$favoriteCheckbox = @$('.checkbox')
    @$favoriteCheckbox.toggleClass 'active', @model.get 'favoriteState'

    return @

  toggleActive: ->
    if @model.toggle() then @model.sync('connect', @model) else @model.sync('disconnect', @model)

  add: ->
    @model.set 'favoriteState', !@model.get 'favoriteState'

    return false
