angular.factory('ipc',  ['$rootScope','cnc',function ($rootScope,cnc) {
  return {
    startArd : function (cmd) {
      if(cmd !== null && cnc.arduino ){
        ipcRenderer.send('send-start',cmd);
        cnc.working = true;
        cnc.file.line.interpreted = 0;
        return true;
      }else{
        return false;
      }
    },
    sendArd : function (cmd,callback) {
      if(cmd !== null && cnc.arduino ){
        ipcRenderer.send('send-command',cmd);
        cnc.working = true;
        cnc.file.line.interpreted = 0;
        //callback();
        return true;
      }else{
        return false;
      }
    },
    on: function  (eventName, callback) {
      ipcRenderer.on(eventName, function (event, arg) {
        callback(event,arg);
        $rootScope.$apply();
      });
    },
    send: function (eventName, data) {
      ipcRenderer.send(eventName, data );
    },
    sendSync: function (eventName, data) {
      return ipcRenderer.sendSync (eventName, data );
    }
  }// return
}]);
