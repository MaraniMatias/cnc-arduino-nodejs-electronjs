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
  // items = { main : [], context : [], }
  for (let i = 0; i < items.main.length; i++) {
    let submenu = items.main[i];
    for (let menu = 0; menu < submenu.length; menu++) {
      //console.log(mMenu.items[i].submenu.items[menu]);
      mMenu.items[i].submenu.items[menu].enabled = !mMenu.items[i].submenu.items[menu].enabled;
    }
  }
  for (let i = 0; i < items.context.length; i++) {
    cMenu.items[items.context[i]].enabled = !cMenu.items[items.context[i]].enabled;
  }
});