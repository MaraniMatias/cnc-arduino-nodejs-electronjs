angular.factory('ipc',  ($rootScope) => {
  const ipcRenderer = electron.ipcRenderer;
  return {
    on:  (eventName, callback) => {
      ipcRenderer.on(eventName, (event, arg) => {
        callback(event,arg);        
        $rootScope.$apply();
      });
    },
    send:  (eventName, data) => {
      ipcRenderer.send(eventName, data );
    },
    sendSync: (eventName, data) => {
      return ipcRenderer.sendSync (eventName, data );
    }
  }// return
});