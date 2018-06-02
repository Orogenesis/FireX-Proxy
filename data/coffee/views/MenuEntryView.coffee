class MenuEntryView extends Backbone.View
  events: ->
    'click': 'choose'

  tagName: ->
    'a'

  initialize: ->
    @listenTo @model, 'change', @render

    @template = Handlebars.templates['menuEntry']

  render: ->
    $(@el).html(@template @model.toJSON())

    return @

  attributes: ->
    'href': @model.get 'resource'

  choose: ->
    @model.set 'isActive', true
