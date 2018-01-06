$ ->
  _.extend Backbone.Model.prototype, Backbone.Validation.mixin

  Handlebars.registerHelper 't', (key) -> new Handlebars.SafeString browser.i18n.getMessage key

  new Router()

  Backbone.history.start()
