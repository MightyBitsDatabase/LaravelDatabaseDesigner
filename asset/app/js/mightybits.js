const {app, dialog} = require('electron').remote
const {ipcRenderer} = require('electron');

var remote = require('electron').remote;
var fs = remote.require('fs')
var path = remote.require('path')

var MightyBits = {}

MightyBits.config = {
  showSidebar : 1,
  currentMode : 'block',
  currentFile : '_blank',
  defaultTitle: 'MightyBits 0.1',
  modified: 0,
  newFile: 1,
  linter: [],
  templatePath :  app.getPath('userData')
}

MightyBits.example_schema = [{"name":"BlogUsers","color":"Red","position":{"x":93,"y":126},"classname":"BlogUser","namespace":"","increment":false,"timestamp":true,"softdelete":false,"column":[{"name":"id","type":"increments","length":"","defaultvalue":"","enumvalue":"","ai":false,"pk":false,"nu":false,"ui":false,"in":false,"un":false,"fillable":false,"guarded":false,"visible":false,"hidden":false,"colid":"c87","order":0},{"name":"username","type":"string","length":"","defaultvalue":"bogus","enumvalue":"","ai":false,"pk":false,"nu":false,"ui":false,"in":false,"un":false,"fillable":false,"guarded":false,"visible":false,"hidden":false,"colid":"c185","order":1},{"name":"password","type":"string","length":"","defaultvalue":"","enumvalue":"","ai":false,"pk":false,"nu":false,"ui":false,"in":false,"un":false,"fillable":false,"guarded":false,"visible":false,"hidden":false,"colid":"c193","order":2},{"name":"profile","type":"text","length":"","defaultvalue":"","enumvalue":"","ai":false,"pk":false,"nu":false,"ui":false,"in":false,"un":false,"fillable":false,"guarded":false,"visible":false,"hidden":false,"colid":"c201","order":3}],"relation":[{"extramethods":"","foreignkeys":"","name":"postsz","relatedmodel":"Post","relationtype":"hasMany","usenamespace":""}],"seeding":[[{"colid":"c87","content":"0"},{"colid":"c185","content":"badgeek"},{"colid":"c193","content":"test123"},{"colid":"c201","content":"profile 0"}],[{"colid":"c87","content":"1"},{"colid":"c185","content":"hello"},{"colid":"c193","content":"test123"},{"colid":"c201","content":"profile 1"}],[{"colid":"c87","content":"2"},{"colid":"c185","content":"void"},{"colid":"c193","content":"test123"},{"colid":"c201","content":"profile 2"}],[{"colid":"c87","content":"3"},{"colid":"c185","content":"john"},{"colid":"c193","content":"john123"},{"colid":"c201","content":"profile 3"}]]},{"name":"Posts","color":"Green","position":{"x":660,"y":231},"classname":"Post","namespace":"","increment":false,"timestamp":false,"softdelete":false,"column":[{"name":"id","type":"increments","length":"","defaultvalue":"","enumvalue":"","ai":false,"pk":false,"nu":false,"ui":false,"in":false,"un":false,"fillable":false,"guarded":false,"visible":false,"hidden":false,"colid":"c95","order":0},{"name":"title","type":"string","length":"","defaultvalue":"","enumvalue":"","ai":false,"pk":false,"nu":false,"ui":false,"in":false,"un":false,"fillable":false,"guarded":false,"visible":false,"hidden":false,"colid":"c218","order":1},{"name":"content","type":"text","length":"","defaultvalue":"","enumvalue":"","ai":false,"pk":false,"nu":false,"ui":false,"in":false,"un":false,"fillable":false,"guarded":false,"visible":false,"hidden":false,"colid":"c226","order":2}],"relation":[{"extramethods":"","foreignkeys":"","name":"Categories","relatedmodel":"Category","relationtype":"hasMany","usenamespace":""}],"seeding":[]},{"name":"Categories","color":"Blue","position":{"x":89,"y":349},"classname":"Category","namespace":"","increment":false,"timestamp":false,"softdelete":false,"column":[{"name":"id","type":"increments","length":"","defaultvalue":"","enumvalue":"","ai":false,"pk":false,"nu":false,"ui":false,"in":false,"un":false,"fillable":false,"guarded":false,"visible":false,"hidden":false,"colid":"c111","order":0},{"name":"name","type":"string","length":"100","defaultvalue":"","enumvalue":"","ai":false,"pk":false,"nu":false,"ui":false,"in":false,"un":false,"fillable":false,"guarded":false,"visible":false,"hidden":false,"colid":"c70","order":1}],"relation":[],"seeding":[]}];

MightyBits.setDocTitle = function(docname)
{
  MightyBits.setTitle(docname + ' - ' + MightyBits.config.defaultTitle)
}

MightyBits.setDefTitle = function(docname)
{
  MightyBits.setTitle('Untitled.cblock - ' + MightyBits.config.defaultTitle)
}

MightyBits.setTitle = function(title)
{
  MightyBits.ipc.sendParam('settitle', title, function(){});
}

MightyBits.newFile = function() {
    MightyBits.config.currentFile = '_blank'
    MightyBits.config.newFile = 1
    MightyBits.config.modified = 0
    MightyBits.clearCanvas();
    MightyBits.setDefTitle();
}

MightyBits.saveFile = function() {
  if (MightyBits.config.currentFile !== '_blank')
  {
      fs.writeFileSync(MightyBits.config.currentFile, MightyBits.getJSON());
      MightyBits.setDocTitle(MightyBits.config.currentFile)
      MightyBits.config.modified = 0
  }else{
      MightyBits.saveAsFile();
  }
}

MightyBits.saveAsFile = function() {
  var filename = dialog.showSaveDialog({
        title: "Save as Skema file",
        defaultPath: "",
        filters: [
          {name: 'MightyBits Skema', extensions: ['skema']},
        ]
      });

  if(typeof(filename) !== 'undefined')
  {
    fs.writeFileSync(filename, MightyBits.getJSON());
  }
}

MightyBits.open = function() {
  dialog.showOpenDialog({properties: ['openFile']}, function(fileName){
    if (fileName !== undefined)
    {
      fs.readFile(fileName[0], 'utf-8', function (err, data) {
          var jsonfile = (JSON.parse(data));
          
          MightyBits.clearCanvas()
          MightyBits.loadJSON(jsonfile)

          MightyBits.config.newFile = 1
          MightyBits.config.currentFile = fileName[0];
          MightyBits.setDocTitle(fileName[0])

      });  
    } 
  });
}

MightyBits.getJSON  = function () {
  return JSON.stringify(DesignerApp.NodeEntities.ExportToJSON())
}

MightyBits.loadJSON = function (json) {
  DesignerApp.NodeEntities.AddNodeCanvas(json);   
}

MightyBits.loadExample = function() {
  MightyBits.newFile()
  DesignerApp.NodeEntities.AddNodeCanvas(MightyBits.example_schema);
}

MightyBits.clearCanvas = function() {
  DesignerApp.NodeEntities.ClearNodeCanvas(DesignerApp.NodeEntities.CurrentNodeCanvas);
}

MightyBits.test = function() {
  MightyBits.ipc.sendParam('settitle', title, function(){});
}


MightyBits.generatePlatform = function() {
  var param = {
    skema_path : '/Users/xcorex/Documents/Projects/Node/jsLaravelGenerator/skema/testing.skema',
    destination_dir : '/Users/xcorex/deploy2'
  }

  MightyBits.ipc.sendParam('generate', param, function(){
    console.log("generate done")
  });

}

