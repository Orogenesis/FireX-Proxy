$ ->
  Backbone.sync = (method, model, options) ->
    addon.port.emit "#{model.port}.#{method}", model.toJSON options