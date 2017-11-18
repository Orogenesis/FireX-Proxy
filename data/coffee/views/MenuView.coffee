class MenuView extends Backbone.View
  el: '#menu'

  initialize: ->
    @listenTo @collection, 'add', @addOne
    @listenTo @collection, 'change:isActive', @changeActiveState

  addOne: (menu) ->
    $(@el).append(new MenuEntryView(model: menu).render().el)

  changeActiveState: (model) ->
    _.each(@collection.without(model), (entryModel) -> entryModel.set('isActive', false)) if model.get 'isActive'