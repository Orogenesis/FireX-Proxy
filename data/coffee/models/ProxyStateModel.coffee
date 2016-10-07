class ProxyStateModel extends Backbone.Model
  startRefreshProcess: ->
    @set 'refreshProcess', true

  stopRefreshProcess: ->
    @set 'refreshProcess', false
    
  defaults: ->
    hCheckbox: false
    refreshProcess: false