class MenuEntryModel extends Backbone.Model {
    get defaults() {
        return {
            iTo: null,
            iIcon: null,
            iText: null,
            iActive: false
        };
    }
}