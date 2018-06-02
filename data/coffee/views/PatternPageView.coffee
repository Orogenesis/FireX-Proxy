class PatternPageView extends Backbone.View
  events: ->
    'submit .bottom-menu'       : 'createElement'
    'click .checkbox.blacklist' : 'toggleBlacklist'

  id: ->
    'pattern'

  initialize: ->
    @listenTo @collection, 'add', @addOne
    @listenTo @collection, 'reset', @addAll

    @listenTo @model, 'change:isBlacklistEnabled', @render

    @template = Handlebars.templates['blacklist']

    Backbone.Validation.bind @

    @model.fetch()

  render: ->
    $(@el).html @template @model.toJSON()

    @$listPatterns      = @$ '.content-wrapper'
    @$patternInput      = @$ 'input[name="blacklist-element"]'
    @$blacklistCheckbox = @$ '.checkbox.blacklist'

    @addAll()

    do @collection.fetch if not @collection.length

    return @

  addAll: ->
    @collection.each @addOne, @

  addOne: (pattern) ->
    @$listPatterns.append new PatternView(model: pattern).render().el

  createElement: (e) ->
    e.preventDefault()

    pattern = new PatternModel
      address   : @$patternInput.val()
      isEnabled : true

    @collection.add pattern if do pattern.save

    $(e.target).trigger 'reset'

  toggleBlacklist: ->
    @model.save
      isBlacklistEnabled: false == @model.get('isBlacklistEnabled')
