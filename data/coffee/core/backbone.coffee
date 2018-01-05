ajaxSync = Backbone.sync

messagePassingSync = (method, model, options = {}) ->
  messagePassing = _.result model, 'messagePassing' || _.result model.collection, 'messagePassing'

  if _.isUndefined messagePassing[method]
    throw new Error 'Error: unknown route.'

  deferred = $.Deferred && $.Deferred()

  handleResponse = (message) ->
    if _.isFunction(options.success)
      options.success.call(model, message, options)

    deferred.resolve message if deferred

  handleError = (error) ->
    if _.isFunction options.error
      options.error.call(model, error, options)

    deferred.reject error if deferred

  attributes = _.extend options.attrs || {}, {
    name    : messagePassing[method]
    message : model.toJSON()
  }

  browser
    .runtime
    .sendMessage attributes
    .then handleResponse, handleError
    .then (response) ->
      if _.isFunction options.complete
        options.complete.call(model, response)

  return deferred && deferred.promise()

getSyncMethod = (model) ->
  if model.messagePassing || (model.collection && model.collection.messagePassing) then messagePassingSync else ajaxSync

Backbone.sync = (method, model, options) ->
  getSyncMethod(model).apply @, [method, model, options]