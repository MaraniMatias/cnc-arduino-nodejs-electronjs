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

window.onbeforeunload = (e) => {
  if( ipcRenderer.sendSync('close', null) ){
    e.returnnValue = undefined;
  }
}

ipcRenderer.on('contextmenu-enabled-res', (event, enable) => {
  //let items = { main: { 0: [0, 1, 4] }, context: [0, 3] }
  let mm = mMenu.items[0].submenu.items;
  mm[0].enabled = enable;
  mm[1].enabled = enable;
  mm[4].enabled = enable;
  let cm = cMenu.items;
  cm[0].enabled = enable;
  cm[3].enabled = enable;
});
