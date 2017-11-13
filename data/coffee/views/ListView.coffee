class ListView extends Backbone.View
  initialize: ->
    @listenTo @collection, 'reset', @addAll
    @listenTo @collection, 'change:favoriteState', @onChange
    @listenTo @collection, 'change:activeState', @onStateChange

    @listenTo @model, 'change:isFavoriteEnabled', @onCheckboxChange
    @listenTo @model, 'change:refreshProcess', @onRefreshProcess

    @template = _.template $('#list-template').html()

  events: ->
    'click .refresh'  : () => @update(true)
    'click .checkbox' : 'toggleFavorites'
    'click .filter'   : 'toggleFilters'

  render: ->
    $(@el).html @template @model.toJSON()

    @delegateEvents()

    @$table   = @$ '#proxy-list-box'
    @$content = @$ '.content-wrapper'
    @$filters = @$ '.filters'

    @addAll()

    @update() if not @collection.length

    return @

  update: (force = false) ->
    @collection.fetch(force)

    @model.startRefreshProcess()

    @$table.empty()

  addOne: (proxy) ->
    view = new ProxyView model: proxy

    @$table.append view.render().el

  addAll: ->
    @$table.empty()

    _.each(@collection.where(favoriteState: @model.get 'isFavoriteEnabled'), @addOne, @)

    @model.stopRefreshProcess()

  onCreateFavorite: (proxy) ->
    @collection.add proxy

  onCheckboxChange: ->
    @render()

  onRefreshProcess: (model, value) ->
    @$content.toggleClass 'spinner', value

  toggleFavorites: ->
    @model.set 'isFavoriteEnabled', !@model.get 'isFavoriteEnabled'

  toggleFilters: ->
    @$filters.toggle()

  onStateChange: (model) ->
    _.each(@collection.without(model), (proxy) -> proxy.set 'activeState', false) if model.get 'activeState'

  onChange: (model, value) ->
    @render()