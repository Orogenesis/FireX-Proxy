class PatternSubmitView extends Backbone.View
  events: ->
    'submit': 'create'
    
  render: ->
    $(@el).html @template

    @addressForm     = $(@el).children()
    @addressTextarea = @$ '#address'

  create: (event) ->
    event.preventDefault()

    patternModel = new PatternModel
    patternModel.set 'address', @addressTextarea.val()

    Backbone.Validation.bind @,
      model: patternModel

    if patternModel.isValid true
      patternModel.save()

    @addressForm.trigger 'reset'

    Backbone.Validation.unbind @,
      model: patternModel