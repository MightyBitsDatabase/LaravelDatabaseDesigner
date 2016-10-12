
//container (NODE) map model and events
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

    //on relation drag to presentation
    DesignerApp.commands.setHandler("nodecanvas:create:relation:maps", function(containerModel, targetId) {

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

            var pres = DesignerApp.NodeEntities.getNewNodePresentationModel();

            // defaults: {
            //     name: '',
            //     type: '',
            //     model: ''
            // },
            targetModel.set(data);

            pres.set({
                model: targetModel.get('name'),
                type: 'maps'                
            });
            console.log(sourceModel)
            //add connecition detail to source node
            sourceModel.get('presentation').add(pres);

            //add graphical connection and event
            DesignerApp.NodeEntities.AddPresentationRelation(sourceModel, pres);
        });

    });


});

//modal map template
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
            this.columns = this.model.get('column');
            this.locations = [];
  
        },
        okClicked: function() {
            var data = Backbone.Syphon.serialize(this);
            this.trigger("okClicked", data);
        },
        render: function() {

            var template_var = this.model.toJSON();
            template_var.locations = this.model.get('column').where({type: 'location'});
            console.log(template_var)
            this.$el.html(this.template(template_var));

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





DesignerApp.module("NodeEntities", function(NodeEntities, DesignerApp, Backbone, Marionette, $, _) {




    NodeEntities.AddPresentationRelation = function(node, relation) {

        var sourceTableContainer = node;
        var targetTableContainer = NodeEntities.getTableContainerFromName(relation.get('model'));
        var destinationRelationModel = relation;

        console.log('sourceTableContainer', sourceTableContainer);
        console.log('targetTableContainer', targetTableContainer);
        console.log('destinationRelationModel', destinationRelationModel);

        var raiseVent = function(evName) {
            DesignerApp.vent.trigger("noderelation:presentation:" + evName, {
                srcTableContainer: sourceTableContainer,
                dstRelation: destinationRelationModel
            });
            //console.log(evName);
        };
        //on delete node also delte referenced relation

        relation.on('change:relatedmodel', function(relationModel) {
            relation.stopListening();

            //console.log(relationModel);

            var targetModel = NodeEntities.getTableContainerFromName(relation.get("name"));
            relation.listenTo(targetModel, "destroy", function() {
                raiseVent("destroyme");
                relation.destroy();
            });
            raiseVent("change");
        });

        //on relation type change update overlay
        relation.on("change:relationtype", function() {
            raiseVent("redraw");
        });

        //on target table destroy, destroy our relation
        relation.listenTo(targetTableContainer, "destroy", function() {
            raiseVent("destroy");
            relation.destroy();
        });

        //on target table relation rename, change our reference and update overlay
        relation.listenTo(targetTableContainer, "change:classname", function(targetNode) {
            // relation.set("relatedmodel", targetNode.get("classname"), {
            //     silent: true
            // });
            raiseVent("rename");
        });

        //on our table rename update overlay
        relation.listenTo(sourceTableContainer, "change:name", function(targetNode) {
            raiseVent("rename");
        });


        //on our table rename update overlay
        relation.listenTo(sourceTableContainer, "change:classname", function(targetNode) {
            raiseVent("rename");
        });

        //on destroy clean up
        relation.on("destroy", function() {
            raiseVent("destroy");
            relation.stopListening();
            relation.off();
            relation.destroy();
        });

        raiseVent("add");
    };


});



DesignerApp.module("NodeModule", function(NodeModule, DesignerApp, Backbone, Marionette, $, _) {

    //raiseVent
    DesignerApp.vent.on("noderelation:presentation:add", function(param) {
        var conn = DesignerApp.NodeModule.Views.CreatePresentationConnection(
            param.srcTableContainer,
            param.dstRelation
        );
        param.dstRelation.set("conn", conn);
    });

    DesignerApp.vent.on("noderelation:presentation:change", function(param) {
        //todo refactor this
        // var conn = param.dstRelation.get("conn");
        // jsPlumb.detach(conn);

        // conn = DesignerApp.NodeModule.Views.CreateConnection(
        //     param.srcTableContainer,
        //     param.dstRelation
        // );
        // param.dstRelation.set("conn", conn);

    });

    DesignerApp.vent.on("noderelation:presentation:rename", function(param) {
        //rename label
        // var srcTableContainer = param.srcTableContainer;
        // var dstRelationModel = param.dstRelation;

        // var conn = param.dstRelation.get("conn");
        // var label = conn.getOverlay("label");

        // label.setLabel(srcTableContainer.get('classname') + ' ' + dstRelationModel.get('relationtype') + ' ' + dstRelationModel.get('relatedmodel'));
    });

    DesignerApp.vent.on("noderelation:presentation:destroy", function(param) {
        var conn = param.dstRelation.get("conn");
        if (conn !== "") {
            if (conn.connector !== null) {
                conn.unbind();
                jsPlumb.detach(conn);
            }
        }

    });

    DesignerApp.vent.on("noderelation:presentation:redraw", function(param) {
        var conn = param.dstRelation.get("conn");
        $(conn.getOverlay('label').canvas).html(param.srcTableContainer.get('name'));
    });

});



DesignerApp.module("NodeModule.Views", function(Views, DesignerApp, Backbone, Marionette, $, _) {
    // Private
    // -------------------------

    Views.CreatePresentationConnection = function(srcTableContainer, dstRelationModel) {
        //todo refactor this
        var conn = jsPlumb.connect({
            source: srcTableContainer.cid,
            target: DesignerApp.NodeEntities.getTableContainerFromName(dstRelationModel.get('model')).cid,
            parameters: {
                relation: dstRelationModel
            },
            overlays: [
                ["Arrow", {
                    location: 1,foldback:1, length: 10
                }],
                ["Label", {
                    cssClass: "label",
                    label: srcTableContainer.get('name') + " - map view",
                    location: 0.3,
                    id: "label"
                }]
            ]
        });
        //todo refactor this
        conn.bind("click", function() {
            DesignerApp.execute("nodecanvas:edit:relation", srcTableContainer, dstRelationModel);
        });

        return conn;
    };

});
