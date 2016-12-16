/**
 * Integration of IPC (ElectronJS) with AngularJS.
 */
angular.factory('ipc', ['$rootScope', 'cnc', function ($rootScope, cnc) {
  return {
    /**
    *  Call the event 'send-start' in electron app.
    */
    startArd : function (arg) {
      if(arg !== null && cnc.arduino ){
        ipcRenderer.send('send-start',arg);
        cnc.working = true;
        cnc.file.line.interpreted = 0;
        return true;
      }else{
        return false;
      }
    },
    /**
    *  Call the event 'send-command' in electron app.
    */
    sendArd : function (cmd) {
      if(cmd !== null && cnc.arduino ){
        ipcRenderer.send('send-command',cmd);
        cnc.working = true;
        cnc.file.line.interpreted = 0;
        return true;
      }else{
        return false;
      }
    },
    // Default in IPC
    on: function  (eventName, callback) {
      ipcRenderer.on(eventName, function (event, arg) {
        callback(event,arg);
        $rootScope.$apply();
      });
    },
    // Default in IPC
    send: function (eventName, data) {
      ipcRenderer.send(eventName, data );
    },
    // Default in IPC
    sendSync: function (eventName, data) {
      return ipcRenderer.sendSync (eventName, data );
    }
  }// return
}]);
