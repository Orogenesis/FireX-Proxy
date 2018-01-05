class ListView extends Backbone.View
  initialize: ->
    @listenTo @collection, 'reset', @onReset
    @listenTo @collection, 'change:favoriteState', @addAll
    @listenTo @collection, 'change:activeState', @onStateChange

    @listenTo @model, 'change:isFavoriteEnabled', @onCheckboxChange
    @listenTo @model, 'change:refreshProcess', @onRefreshProcess
    @listenTo @model, 'change:countryFilter change:protocolFilter', @onFilterChange

    @template = Handlebars.templates['proxyList']

    @model.fetch()

  events: ->
    'click .filter'                      : 'toggleFilterPanel'
    'click .refresh'                     : () => @update(true)
    'click .checkbox'                    : 'toggleFavorites'
    'change [name="country"]'            : 'updateCountryFilter'
    'click .protocol-selector button'    : 'updateProtocolFilter'
    'click #no-proxy-list .reset-button' : 'resetFilters'

  render: ->
    $(@el).html @template @model.toJSON()

    @$proxyList       = @$ '#proxy-list-box'
    @$emptyWarning    = @$ '#no-proxy-list'
    @$content         = @$ '.content-wrapper'
    @$filterButton    = @$ 'i.filter'
    @$favoritesToggle = @$ '.right-panel .checkbox'
    @$filters         = @$ '.filters'
    @$countryFilter   = @$ '[name="country"]'
    @$protocolButtons = @$ '.protocol-selector'
    @$filterCounter   = @$ 'i.filter .counter'

    if @collection.size() then @addAll() else @update()

    return @

  update: (force = false) ->
    do @$proxyList.empty

    @collection.fetch {
      attrs:
        force: force
      success: (model, message) =>
        @collection.reset message
      complete: =>
        @model.stopRefreshProcess()
    }

    @model.startRefreshProcess()

  addOne: (proxy) ->
    view = new ProxyView model: proxy

    @$proxyList.append view.render().el

  addAll: ->
    do @$proxyList.empty

    filteredEntries = @collection
      .byCountry @model.get('countryFilter')
      .byProtocol @model.get('protocolFilter')
      .byFavorite @model.get('isFavoriteEnabled')

    _.each filteredEntries.models, @addOne, @

    @$emptyWarning.toggle _.size(filteredEntries.models) == 0

  onCreateFavorite: (proxy) ->
    @collection.add proxy

  onCheckboxChange: ->
    @$favoritesToggle.toggleClass 'active'

    @addAll()

  onRefreshProcess: (model, value) ->
    @$content.toggleClass 'spinner', value

  toggleFavorites: ->
    @model.set 'isFavoriteEnabled', !@model.get 'isFavoriteEnabled'

  toggleFilterPanel: ->
    if not @model.isRefresh()
      @$filters.toggleClass 'visible'
      @$filterButton.toggleClass 'active'

  updateCountryFilter: ->
    @model.set 'countryFilter', @$countryFilter.val()

  updateProtocolFilter: (e) ->
    $button = @$(e.target)
    $button.toggleClass 'active'

    @model.setProtocolState($button.text(), $button.hasClass 'active')

  updateProtocols: ->
    _.each @collection.getProtocols(), (newProtocol) =>
      if _.isUndefined @model.getProtocolState(newProtocol)
        @model.setProtocolState(newProtocol, true)

    @renderProtocolButtons()

  renderProtocolButtons: ->
    @$protocolButtons.empty()

    _.each @model.get('protocolFilter'), (proto, idx) =>
      @$protocolButtons.append $("<button>").text(idx)

    @$protocolButtons.find('button').each (idx, button) =>
      $(button).toggleClass 'active', @model.get('protocolFilter')[do $(button).text]

  onStateChange: (model) ->
    _.each(@collection.without(model), (proxy) -> proxy.set 'activeState', false) if model.get 'activeState'

  onReset: ->
    @updateProtocols()
    @updateCountries()

    @addAll()

  onFilterChange: ->
    do @addAll if @collection.size()

    @updateFilterCount()

  updateCountries: ->
    countries = _.uniq _.union @collection.pluck('country'), @model.get('countryFilter')
      .map (name) =>
        id       : name
        text     : name
        selected : _.contains @model.get('countryFilter'), name

    @$countryFilter
      .val []
      .select2
        data                    : countries
        minimumResultsForSearch : -1
        placeholder             : i18next.t 'country'
        multiple                : true
        maximumSelectionLength  : 10
        width                   : '100%'

  updateFilterCount: ->
    counter = @model.countFilters()

    @$filterCounter.toggle(counter != 0)
    @$filterCounter.text(counter)

  resetFilters: ->
    @model.resetFilters()

    @updateProtocols()
    @updateCountries()