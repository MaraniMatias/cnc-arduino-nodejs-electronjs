const {remote, ipcRenderer} = require('electron');
const {Menu, MenuItem} = remote;
const mainMenu = require('./../lib/menuMain.js');
const contextMenu = require('./../lib/menuContext.js');

var cMenu = Menu.buildFromTemplate(contextMenu);
var mMenu = Menu.buildFromTemplate(mainMenu);
Menu.setApplicationMenu(mMenu);

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  cMenu.popup(remote.getCurrentWindow());
}, false);

ipcRenderer.on('contextmenu-enabled-res', (event, items) => {
  for (let i = 0; i <= items; i++) {
    cMenu.items[items[i]].enabled = !cMenu.items[items[i]].enabled;
  }
});