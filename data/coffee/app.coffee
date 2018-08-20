$ ->
  _.extend Backbone.Model.prototype, Backbone.Validation.mixin

  Handlebars.registerHelper
    ifCond : (v1, operator, v2, options) ->
      switch operator
        when 'eq'
          return if v1 is v2 then options.fn this else options.inverse this
        when 'ne'
          return if v1 != v2 then options.fn this else options.inverse this
        when 'lt'
          return if v1 < v2 then options.fn this else options.inverse this
        when 'lte'
          return if v1 <= v2 then options.fn this else options.inverse this
        when 'gt'
          return if v1 > v2 then options.fn this else options.inverse this
        when 'gte'
          return if v1 >= v2 then options.fn this else options.inverse this
        else
          return options.inverse this
    t      : (k) -> new Handlebars.SafeString browser.i18n.getMessage k
    lower  : (s) -> String(s).toLowerCase()
    upper  : (s) -> String(s).toUpperCase()

  new Router()

  Backbone.history.start()
