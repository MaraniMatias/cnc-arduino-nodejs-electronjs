const
  electron = require('electron'),
  remote = electron.remote
  ;
  require('./../js/contextMenu.js');

/*
//,ipcRenderer = electron.ipcRenderer
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
