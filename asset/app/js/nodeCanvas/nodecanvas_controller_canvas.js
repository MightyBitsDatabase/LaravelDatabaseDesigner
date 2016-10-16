DesignerApp.module("NodeCanvas.Controller", function(Controller, DesignerApp, Backbone, Marionette, $, _) {


    var viewNodeCanvas = Controller.viewNodeCanvas;
    var presentationId = 0;

    viewNodeCanvas.on("canvas:addmap", function() {
        DesignerApp.NodeEntities.AddPresentationNode();                      
    });

    viewNodeCanvas.on("canvas:createcontainer", function() {

        var container = DesignerApp.NodeEntities.getNewTableContainer();
        //console.log(container);
        var view = new DesignerApp.NodeModule.Modal.CreateTableContainer({
            model: container
        });

        var modal = DesignerApp.NodeModule.Modal.CreateTestModal(view);

        view.on("okClicked", function(data) {

            if (data.classname === '') data.classname = data.name

            if (container.set(data, {
                validate: true
            })) {
                data.position = {
                    x: 100,
                    y: 100
                };
                console.log(data);

                var newTable = DesignerApp.NodeEntities.AddNewNode(data);

                if(data.increment === true)
                {
                    newTable.get('column').add({  
                        name:"id",
                        type:"increments",
                        length:"",                    
                        html_input:"text",
                        visible:false
                    });
                }

            } else {
                view.trigger("formDataInvalid", container.validationError);
                modal.preventClose();
            }
        });

    });

    viewNodeCanvas.on("canvas:new", function() {
        MightyBits.newFile()
    });

    viewNodeCanvas.on("canvas:open", function() {
        MightyBits.open()
    });



    viewNodeCanvas.on("canvas:saveasgist", function() {
        var view = new DesignerApp.NodeModule.Modal.GistSaveAs({});
        var modal = DesignerApp.NodeModule.Modal.CreateTestModal(view);

        view.listenTo(view, "okClicked", function(data) {
            saveGist(data.filename + ".skema", data.description);
            modal.preventClose();
        });

    });

    viewNodeCanvas.on("canvas:save", function() {
        MightyBits.saveFile()
    });

    viewNodeCanvas.on("canvas:saveas", function() {
        MightyBits.saveAsFile()
    });

    viewNodeCanvas.on("canvas:loadexample", function() {
        MightyBits.loadExample()
    });

    viewNodeCanvas.on("canvas:clearcanvas", function() {
        MightyBits.clearCanvas()
    });

    viewNodeCanvas.on("canvas:generate", function() {
        // var view = new DesignerApp.NodeModule.Modal.Generate({
        //     content: DesignerApp.NodeEntities.GenerateCode()
        // });
        // var modal = DesignerApp.NodeModule.Modal.CreateTestModal(view);
        MightyBits.generatePlatformTo()
    });

});