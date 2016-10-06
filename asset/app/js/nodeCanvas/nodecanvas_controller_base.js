DesignerApp.module("NodeCanvas.Controller", function(Controller, DesignerApp, Backbone, Marionette, $, _) {

    // INIT CANVAS
    // refactor this
    Controller.viewNodeCanvas = new DesignerApp.NodeCanvas.Views.NodeCanvas({
        collection: DesignerApp.NodeEntities.getNodeCanvas()
    });
    //
    //  LAUNCH
    //

    DesignerApp.mainContent.show(Controller.viewNodeCanvas);


    //todo refactor
    DesignerApp.commands.setHandler("nodecanvas:edit:relation", function(a, b) {

        var view = new DesignerApp.NodeModule.Modal.EditRelationItem({
            model: b
        }, {
            container: a
        });
        var modal = DesignerApp.NodeModule.Modal.CreateTestModal(view);

        view.on("okClicked", function(data) {
            if (b.set(data, {
                validate: true
            })) {

            } else {
                view.trigger("formDataInvalid", b.validationError);
                modal.preventClose();
            }
        });

        view.on("delClicked", function(model) {
            model.destroy();
        });

        //console.log("Wew");

    });

    //todo: refactor this
    DesignerApp.commands.setHandler("nodecanvas:create:relation", function(containerModel, targetId) {

        var targetName = DesignerApp.NodeEntities.getTableContainerFromNodeCid(targetId).get("name");
        var targetClass = DesignerApp.NodeEntities.getTableContainerFromNodeCid(targetId).get("classname");
        
        var view = new DesignerApp.NodeModule.Modal.CreateRelation({
            model: containerModel,
            target: targetName,
            targetClass: targetClass
        });

        var modal = DesignerApp.NodeModule.Modal.CreateTestModal(view);

        view.listenTo(view, "okClicked", function(data) {
            var new_rel = DesignerApp.NodeEntities.getNewRelationModel();
            if (new_rel.set(data, {
                validate: true
            })) {


                /*
                    new_rel
                    -------
                    extramethods:""
                    foreignkeys:""
                    name:"Posts"
                    relatedcolumn:"id"
                    relatedmodel:"Post"
                    relationtype:"hasOne"
                    usenamespace:""
                */


                console.log('wew', new_rel);
                new_rel.set('name', targetName);
                var relation = containerModel.get("relation");
                relation.add(new_rel);
                DesignerApp.NodeEntities.AddRelation(containerModel, new_rel);

                //destination table column
                var dest_node_column = (DesignerApp.NodeEntities.getTableContainerFromClassName(data.relatedmodel)).get('column');

                if (new_rel.get('relationtype') === 'belongsTo')
                {
                    var foreign_key = targetName.toLowerCase() + "_id";
                    containerModel.get("column").add({name: foreign_key, type: "integer", in: true});
                }else{
                    var foreign_key = (containerModel.get('name').toLowerCase()) + "_id";                    
                    var res = dest_node_column.where({
                        name: foreign_key
                    })[0];
                    //if already have modelname_id dont add item                    
                    if (!res) dest_node_column.add({name: foreign_key, type: "integer", in: true});                
                    //foreign key
                }




                
                // console.log(new_rel);
            } else {
                view.trigger("formDataInvalid", new_rel.validationError);
                modal.preventClose();
                // console.log("error");
            }
        });

    });


});