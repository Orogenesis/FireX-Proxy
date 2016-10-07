$ ->
  window.l10n = new Polyglot

  _.extend Backbone.Validation.callbacks,
    valid: (view, attr, selector) ->
      view.$("*[#{selector}=#{attr}]").next()
      .removeClass('failure')
      .addClass('done')
    invalid: (view, attr, error, selector) ->
      view.$("*[#{selector}=#{attr}]").next()
      .removeClass('done')
      .addClass('failure')

  addon.port.once 'onLocaleResponse', (locale) ->
      l10n.extend Locales[locale] unless Locales[locale] is undefined

      router = new Router
      Backbone.history.start()