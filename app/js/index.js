/* global Notification */
const
  electron = require('electron'),
  remote = electron.remote,
  ipcRenderer = electron.ipcRenderer
;

require('./../js/contextMenu.js');
require('./../js/angular.js');

//ipcRenderer.send('setArduino');


var myNotification = new Notification('Title', {
  body:'Vercion de app pack.json'+ remote.app.getVersion()
});

/*
    var alertOnlineStatus = function() {
      window.alert(navigator.onLine ? 'online' : 'offline');
    };
    window.addEventListener('online',  alertOnlineStatus);
    window.addEventListener('offline',  alertOnlineStatus);
    alertOnlineStatus();
    
    var updateOnlineStatus = function() {
      ipcRenderer.send('console', navigator.onLine ? 'online' : 'offline');
    };
    window.addEventListener('online',  updateOnlineStatus);
    window.addEventListener('offline',  updateOnlineStatus);
    updateOnlineStatus();
    */