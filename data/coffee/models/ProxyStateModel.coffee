class ProxyStateModel extends Backbone.Model
  url: '#/filters'

  initialize: ->
    @on 'change:protocolFilter change:countryFilter', () => @save()

  getProtocolState: (proto) ->
    @get('protocolFilter')[proto]

  setProtocolState: (proto, newState) ->
    newProtocolFilter        = {}
    newProtocolFilter[proto] = newState

    @set('protocolFilter', _.extend @get('protocolFilter'), newProtocolFilter)

    @trigger('change:protocolFilter')

  save: ->
    browser.storage.local.set
      filters:
        protocolFilter : @get 'protocolFilter'
        countryFilter  : @get 'countryFilter'

  fetch:  ->
    browser.storage.local.get('filters').then (persistent) =>
      @set _.defaults persistent.filters,
        countryFilter  : [],
        protocolFilter : {}

  startRefreshProcess: ->
    @set 'refreshProcess', true

  stopRefreshProcess: ->
    @set 'refreshProcess', false

  isRefresh: ->
    @get 'refreshProcess'

  resetFilters: ->
    @set 'countryFilter', []
    @set 'protocolFilter', {}

    @save()

  countFilters: ->
    counter = 0

    counter++ if not _.isEmpty @get('countryFilter')
    counter++ if _.any(@get('protocolFilter'), (value) => value == false)

    return counter

  defaults: ->
    isFavoriteEnabled : false
    refreshProcess    : false
    protocolFilter    : {}
    countryFilter     : []
