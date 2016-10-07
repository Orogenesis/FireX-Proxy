class PatternSubmitView extends Backbone.View
  events: ->
    'submit': 'create'
    
  initialize: ->
    @template = _.template $('#pattern-add-template').html()

  render: ->
    $(@el).html @template

    @$jAddressForm = $(@el).children()
    @$jAddress     = @$ '#address'

  create: (event) ->
    event.preventDefault()

    patternModel = new PatternModel
    patternModel.set 'address', @$jAddress.val()

    Backbone.Validation.bind @,
      model: patternModel

    if patternModel.isValid true
      patternModel.save()

    @$jAddressForm.trigger 'reset'

    Backbone.Validation.unbind @,
      model: patternModel