const {
  remote,
  ipcRenderer
} = require('electron');
const {
  Menu,
  MenuItem
} = remote;
const mainMenu = require('./../lib/menuMain.js');
const contextMenu = require('./../lib/menuContext.js');

var cMenu = Menu.buildFromTemplate(contextMenu);
var mMenu = Menu.buildFromTemplate(mainMenu);
Menu.setApplicationMenu(mMenu);

//  Load context menu.
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  cMenu.popup(remote.getCurrentWindow());
}, false);

/**
 * Is issued before closing the window.
 * Call the 'close' event in the app to stop running on arduino.
 */
window.onbeforeunload = (e) => {
  if (ipcRenderer.sendSync('close', null)) {
    e.returnnValue = undefined;
  }
}

ipcRenderer.on('progres-res', (event, data) => {
  $('#modalProgressInfo').text( data.info + "Comvirtindo..." + (data.perc * 100).toFixed(2) + "%");
})

// Serves to lock menus when arduino works.
ipcRenderer.on('contextmenu-enabled-res', (event, enable) => {
  //let items = { main: { 0: [0, 1, 4] }, context: [0, 3] }
  let mm = mMenu.items[0].submenu.items;
  mm[0].enabled = enable; // open file
  mm[1].submenu.items[0].enabled = enable; // Arduino
  mm[5].enabled = enable; // test
  mm[4].enabled = enable; // Preferancia
  let cm = cMenu.items;
  cm[0].enabled = enable;
  cm[3].enabled = enable;
});
