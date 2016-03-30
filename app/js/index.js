/* global window */
const electron     =  require('electron');
const remote       =  electron.remote;
const ipcRenderer  =  electron.ipcRenderer;
const Menu         =  remote.require('menu');
const mainMenu     =  require('./../lib/menuMain.js');
const contextMenu  =  require('./../lib/menuContext.js');

var cMenu = Menu.buildFromTemplate(contextMenu);
var mMenu = Menu.buildFromTemplate(mainMenu.menu);
Menu.setApplicationMenu(mMenu);

window.addEventListener('contextmenu',  (e) => {
  e.preventDefault();
  cMenu.popup(remote.getCurrentWindow());
}, false);

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
