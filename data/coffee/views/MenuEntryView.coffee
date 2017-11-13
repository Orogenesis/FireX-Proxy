class MenuEntryView extends Backbone.View
  events: ->
    'click': 'choose'

  tagName: ->
    'a'

  initialize: ->
    @template = _.template $('#menu-entry-template').html()

    @listenTo @model, 'change', @render

  render: ->
    $(@el).html(@template @model.toJSON())

    return @

  attributes: ->
    'href': @model.get 'resource'

  choose: ->
    @model.set 'isActive', true