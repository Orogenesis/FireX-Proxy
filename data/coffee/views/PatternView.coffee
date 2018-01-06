class PatternView extends Backbone.View
  tagName: ->
    'div'

  attributes: ->
    'class': 'pattern'

  events: ->
    'click .remove' : 'destroy'
    'click .power'  : 'toggle'

  initialize: ->
    @listenTo @model, 'change', @render
    @listenTo @model, 'destroy', @remove

    @template = Handlebars.templates['blacklistElement']

  render: ->
    $(@el).html @template @model.toJSON()

    return @

  destroy: ->
    @model.destroy()

  toggle: ->
    @model.save {
      isEnabled: @model.get('isEnabled') == false
    }
