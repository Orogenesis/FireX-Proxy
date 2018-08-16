class ProxyView extends Backbone.View
  events: ->
    'click'           : 'toggleActive'
    'click .checkbox' : 'add'

  initialize: ->
    @listenTo @model, 'change', @render
    @listenTo @model, 'destroy', @remove

    @template = Handlebars.templates['proxyElement']

  render: ->
    # https://stackoverflow.com/questions/11594961/backbone-not-this-el-wrapping/11598543#11598543
    $oldel = @.$el;
    $newel = $(@template @model.toJSON());
    @.setElement($newel);
    $oldel.replaceWith($newel);

    return @

  toggleActive: ->
    if @model.toggle() then @model.sync('connect', @model) else @model.sync('disconnect', @model)

  add: ->
    @model.set 'favoriteState', !@model.get 'favoriteState'

    return false
