class Menu extends Backbone.Collection
  constructor: (options) ->
    super options

    @model = MenuEntryModel