const {remote,ipcRenderer} = require('electron');
const {Menu, MenuItem} = remote;
const mainMenu     =  require('./../lib/menuMain.js');
const contextMenu  =  require('./../lib/menuContext.js');

var cMenu = Menu.buildFromTemplate(contextMenu);
var mMenu = Menu.buildFromTemplate(mainMenu);
Menu.setApplicationMenu(mMenu);

window.addEventListener('contextmenu',  (e) => {
  e.preventDefault();
  cMenu.popup(remote.getCurrentWindow());
}, false);

// no se porque cuando la pantalla es menor a 770 tiene que se distinta la posicion
// con angular usar $scope.$apply(function(){}); para aplicar los cambios 
window.onresize = function(event) {
  let size = window.outerHeight < 770 ? 81 : 65;
  $('#statusbar').css( 'top', window.outerHeight - size);
};