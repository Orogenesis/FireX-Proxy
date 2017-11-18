class PatternPageView extends Backbone.View
  events: ->
    'click .checkbox' : 'toggleTemplates'

  id: ->
    'pattern'

  initialize: ->
    @submitSubView = new PatternSubmitView

    @listenTo @collection, 'add', @addOne
    @listenTo @model, 'change:isBlacklistEnabled', @onCheckboxChange

    @collection.fetch()

  render: ->
    $(@el).html @template @model.toJSON()

    @submitSubView.setElement(@$ '#pattern-add-subview').render()

    @delegateEvents()

    @$listPatterns = @$ '.content-wrapper'

    @addAll()

    return @

  toggleTemplates: ->
    @model.set 'isBlacklistEnabled', !@model.get 'isBlacklistEnabled'

  onCheckboxChange: ->
    @render()

  addAll: ->
    @collection.each @addOne, @

  onLoadList: (patterns) ->
    @collection.reset patterns

  onCreatePattern: (pattern) ->
    @collection.add pattern

  addOne: (pattern) ->
    view = new PatternView model: pattern

    @$listPatterns.append view.render().el