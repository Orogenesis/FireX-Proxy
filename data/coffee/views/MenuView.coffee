class MenuView extends Backbone.View
  initialize: ->
    @el = '#menu'

    @listenTo @collection, 'add', @addOne
    @listenTo @collection, 'change:iActive', @changeActiveState

  addOne: (menu) ->
    $(@el).append(new MenuEntryView(model: menu).render().el)

  changeActiveState: (model, value, options) ->
    _.each(@collection.without(model), (entryModel) -> entryModel.set('iActive', false)) if model.get 'iActive'