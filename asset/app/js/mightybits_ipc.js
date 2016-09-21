
//ipc stuff

MightyBits.ipc = {};
MightyBits.ipc.ipcRenderer = require('electron').ipcRenderer
MightyBits.ipc.globalCounter = 0

MightyBits.ipc.sendBasicIpc = function(cmd, fun)
  {
   var localCallCounter = ++MightyBits.ipc.globalCounter;
   MightyBits.ipc.ipcRenderer.once('done-ipc' + localCallCounter, function (event, data) {
       fun ( data );
   });
   MightyBits.ipc.ipcRenderer.send('do-ipc', {count: localCallCounter, command: cmd});
}

MightyBits.ipc.sendParam = function (cmd, param, fun)
{
  var command = {command: cmd};
  command.params = param;
  MightyBits.ipc.sendBasicIpc(command, fun);
}

MightyBits.ipc.ipcRenderer.on('statusipc', (event, message) => {
  MightyBits.ipc.processIpcBroadcast(message)
})

MightyBits.ipc.processIpcBroadcast = function(data)
{ 
  var command = data['command'];
  var params = data['params'];

  switch (command) {
   
  }
}