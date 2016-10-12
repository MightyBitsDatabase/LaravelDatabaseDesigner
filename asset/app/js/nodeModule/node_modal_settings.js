DesignerApp.module("NodeModule.Modal", function(Modal, DesignerApp, Backbone, Marionette, $, _) {

    Modal.CreateTableContainer = Modal.BaseModal.extend({
        template: _.template($('#about-template').html()),
        events: {
            'click .ok': 'okClicked'
        },
        idPrefix: "container",
        initialize: function() {
        },
        okClicked: function() {
            this.trigger("okClicked", data);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this.el;
        }
    });

});