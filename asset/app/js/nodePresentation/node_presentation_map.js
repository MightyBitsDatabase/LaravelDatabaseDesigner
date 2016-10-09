
//container map model and events
DesignerApp.module("NodeModule.Views", function(Views, DesignerApp, Backbone, Marionette, $, _) {

    Views.TableMap = Backbone.Marionette.CompositeView.extend({
        template: "#nodecontainer-map",
        className: "node-view item",
        childView: Views.NodeItem,
        childViewContainer: ".nodecollection-container",
        nodeViewList: [],
        childEvents: {

        },
        modelEvents: {
            "change": "modelChanged",
        },
        modelChanged: function(m) {
            this.$el.removeClass("node-" + m._previousAttributes.color);            
            this.$el.addClass("node-" + this.model.get("color"));      
            this.render();
        },
        triggers: {
            'click .edit': 'presentationmap:edit',
        },
        initialize: function() {
            this.$el.attr("id", this.model.cid);
            this.$el.addClass("node-" + this.model.get("color"));  

        },
        onAddChild: function(child) {


        },
        onShow: function() {

        },
        onDomRefresh: function(dom) {

            jsPlumb.makeTarget(this.el, {
                allowLoopback: false,
                anchor: 'Continuous'
            }, this);


            jsPlumb.makeSource(this.$el.find(".conn"), {
                parent: this.el,
                anchor: 'Continuous',
                allowLoopback: false,
                parameters: {
                    node: this.model
                },
            }, {
                view: this
            });

            jsPlumb.draggable(this.el, {
                containment: 'parent'
            }, {
                view: this
            });

        },
        onRender: function(dom) {
            //console.log($("body"));

            var self = this;

            var pos = this.model.get("position");
            this.$el.css("left", pos.x);
            this.$el.css("top", pos.y);

            this.$el.on("dragstop", function(event, ui) {
                if (typeof ui.helper.attr('tag') == 'undefined') {
                    self.model.set("position", {
                        x: ui.position.left,
                        y: ui.position.top,
                    });
                }
            });
        },
        onBeforeDestroy: function() {
            var self = this;
            jsPlumb.detachAllConnections(this.$el);
            jsPlumb.removeAllEndpoints(this.$el);

            setTimeout(function() { //jquery draggable memory leak fix
                self.remove();
            }, 500);

        }
    });


});

//create modal
DesignerApp.module("NodeCanvas.Controller", function(Controller, DesignerApp, Backbone, Marionette, $, _) {

    var viewNodeCanvas = Controller.viewNodeCanvas;

    viewNodeCanvas.on("childview:presentationmap:edit", function(childview) {
        var containerModel = childview.model;
        console.log(containerModel);

        var view = new DesignerApp.NodeModule.Modal.presentationMapModal({
            model: containerModel
        });
        var modal = DesignerApp.NodeModule.Modal.CreateTestModal(view);

        view.listenTo(view, "okClicked", function(data) {
            //console.log(data);
            if (containerModel.set(data, {
                validate: true
            })) {
                //DesignerApp.NodeEntities.AddNewNode(data);
            } else {
                view.trigger("formDataInvalid", containerModel.validationError);
                modal.preventClose();
            }
        });
    });


    DesignerApp.commands.setHandler("nodecanvas:create:relationmaps", function(containerModel, targetId) {

        var targetModel = DesignerApp.NodeEntities.getTableContainerFromNodeCid(targetId);
        var targetModelName = targetModel.get("name");
        var targetClass = targetModel.get("classname");

        var sourceModel = containerModel;
        var sourceModelName = sourceModel.get('name');


        var view = new DesignerApp.NodeModule.Modal.presentationMapModal({
            model: sourceModel,
            targetModel: targetModel,
        });
        
        console.log('connect->', sourceModelName, 'to', targetModelName)

        var modal = DesignerApp.NodeModule.Modal.CreateTestModal(view);

        view.listenTo(view, "okClicked", function(data) {
            console.log(data)
        });

    });


});

//modal template
DesignerApp.module("NodeModule.Modal", function(Modal, DesignerApp, Backbone, Marionette, $, _) {

    Modal.presentationMapModal = Modal.BaseModal.extend({
        template: _.template($('#presentationmap-template').html()),
        optionTemplate: _.template("<select id=\"relation-relatedcolumn\" name=\"relatedcolumn\" class=\"form-control\"><% _.each(relatedcolumn, function(related) { %><option value=\"<%=related.name%>\" ><%=related.name%><\/option><% }); %><\/select>"),                
        events: {
            'click .addnode': 'okClicked'
        },
        idPrefix: "container",
        initialize: function(initParam) {
            this.listenTo(this, "formDataInvalid", this.formDataInvalid);
            this.targetModel = initParam.targetModel;
            this.columns = this.model.get('column')
        },
        okClicked: function() {
            var data = Backbone.Syphon.serialize(this);
            this.trigger("okClicked", data);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));

            // var template_var = this.optionTemplate(
            //     {columns: this.model.get('column')}
            // );            

            // this.$('#columns').html(template_var);

            // this.$("#container-increment").prop("checked", true);
            // this.$("#container-timestamp").prop("checked", true);
            
            return this.el;
        }
    });


});