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

ipcRenderer.on('contextmenu-enabled-res', (event, enable) => {
  //let items = { main: { 0: [0, 1, 4] }, context: [0, 3] }
  let mm = mMenu.items[0].submenu.items;
  mm[0].enabled = enable;
  mm[1].enabled = enable;
  mm[4].enabled = enable;
  let cm = cMenu.items;
  cm[0].enabled = enable;
  cm[3].enabled = enable;

  /*
  let mm = mMenu.items;
  for (let keyM in items.main) {
    let menu = items.main[keyM];
    if (typeof (menu) === 'object') {
      for (let keySM in menu) {
        let isubm = menu[keySM];
        mm[keyM].submenu.items[isubm].enabled = !mm[keyM].submenu.items[isubm].enabled;
      }
    }
  }
  for (let i = 0, x = items.context.length; i < x; i++) {
    cMenu.items[items.context[i]].enabled = !cMenu.items[items.context[i]].enabled;
  }
  */
});