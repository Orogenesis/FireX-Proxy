class PatternView extends Backbone.View
  tagName: ->
    'div'

  attributes: ->
    'class': 'pattern'

  events: ->
    'click .remove'  : 'destroy'
    'click .address' : 'edit'
    'blur .edit'     : 'done'

  initialize: ->
    @listenTo @model, 'change', @render
    @listenTo @model, 'destroy', @remove

    @template = _.template $('#pattern-template').html()

    Backbone.Validation.bind @

  render: ->
    $(@el).html @template @model.toJSON()

    @editableTextarea = @$ '.edit'

    return @

  destroy: ->
    @model.destroy()

  edit: ->
    @model.toggleEditing()
    @editableTextarea.focus()

  done: ->
    if @model.isEditing()
      address = @editableTextarea.val()

      if @model.isValid true
        @model.save
          address: address,
          editingState: false
      else
        @destroy()