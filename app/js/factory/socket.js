/*
angular.factory('socket',  ($rootScope) => {
  var ipcRenderer = electron.ipcRenderer;
  return {
    on:  (eventName, callback) => {
      ipcRenderer.on(eventName, (event, arg) => {//
        callback(event,arg);        
        $rootScope.$apply();
      });// on
    },
    emit:  (eventName, data, callback) => {
      ipcRenderer.send(eventName, data, () => {
        var args = arguments;
        $rootScope.$apply( () => {
          if (callback) {
            callback.apply(ipcRenderer, args);
          }
        });
      })
    }
  }// return
})
;*/