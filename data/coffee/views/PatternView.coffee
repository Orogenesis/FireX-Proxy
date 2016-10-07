class PatternView extends Backbone.View
  tagName: ->
    'div'

  attributes: ->
    'class': 'd-set'

  events: ->
    'click .d-rm'  : 'destroy'
    'click .d-uri' : 'edit'
    'blur .edit'   : 'done'

  initialize: ->
    @listenTo @model, 'change', @render
    @listenTo @model, 'destroy', @remove

    @template = _.template $('#pattern-template').html()

    Backbone.Validation.bind @

  render: ->
    $(@el).html @template @model.toJSON()

    @editableIcon = @$ '.edit'

    return @

  destroy: ->
    @model.destroy()

  edit: ->
    @model.toggleEditing()
    @editableIcon.focus()

  done: ->
    if @model.isEditing()
      address = @editableIcon.val()

      if @model.isValid true
        @model.save
          address: address,
          editingState: false
      else
        @destroy()