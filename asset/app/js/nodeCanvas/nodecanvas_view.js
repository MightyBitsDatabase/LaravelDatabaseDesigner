DesignerApp.module("NodeCanvas.Views", function(Views, DesignerApp, Backbone, Marionette, $, _) {

    Views.NodeCanvas = Backbone.Marionette.CompositeView.extend({
        id: "container",
        template: "#nodecanvas-template",
        childView: DesignerApp.NodeModule.Views.TableContainer,
        triggers: {
            "click .addcontainer": "canvas:createcontainer",
            "click .new": "canvas:new",
            "click .open": "canvas:open",
            "click .save": "canvas:save",
            "click .saveas": "canvas:saveas",
            "click .generate": "canvas:generate",
            "click .loadexample": "canvas:loadexample",
            "click .opengist": "canvas:opengist",
            "click .opengistid": "canvas:opengistid",
            "click .savecurrentgis": "canvas:savecurrentgis",
            "click .saveasgist": "canvas:saveasgist",
            "dblclick": "canvas:createcontainer"
        },
    });

});