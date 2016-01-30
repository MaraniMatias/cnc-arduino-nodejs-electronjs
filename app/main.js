const dirBase   = `file://${__dirname}/html/`,
      fileConfig= require('./../gulp-builder-config.json'),
      electron  = require('electron'),
      app       = electron.app,
      BrowserWindow  = electron.BrowserWindow,
      ipcMain        = electron.ipcMain,
      dialog         = electron.dialog,
      globalShortcut = electron.globalShortcut; // para ctrl+
var mainWindow = null;

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function () {
  mainWindow = new BrowserWindow({ minWidth: 1000, minHeight: 620 , title:fileConfig.app.name});
  mainWindow.loadURL(dirBase+'index.html');
  
  // Open the devtools.
  // mainWindow.openDevTools();

  ipcMain.on('message', function (event, status) {
    //var chosen = 
    dialog.showMessageBox(mainWindow, {
      type: status.type,
      title: status.title,
      cancelId:0,
      buttons: ['Aceptar'],
      message: status.header,
      detail: status.msg
    });
    //if (chosen == 0) mainWindow.destroy();
  });
      
  mainWindow.on('closed', function () {
    mainWindow = null;
    if (process.platform != 'darwin') {
      app.quit();
    }
  });
  
  var prefsWindow = new BrowserWindow({
    width: 400, height: 400,
    resizable:false, show:false,
    skipTaskbar:true , title:'Preferencias.'
    }); 
  prefsWindow.loadURL(dirBase+'prefe.html');
  
  ipcMain.on('show-prefs', function(event, status) {
    prefsWindow.show();
  });
  ipcMain.on('hide-prefs', function(event, status) {
    prefsWindow.hide();
  });

  
  ipcMain.on('file',function(event,status) {
    const dialog = electron.dialog;
    console.log(dialog.showOpenDialog({
      filters: [
        { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
        { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: [ 'openFile', 'multiSelections' ]}));//openDirectory
  });
  var ret = globalShortcut.register('ctrl+f', function() {
    console.log('ctrl+f is pressed');
  });
  if (!ret) {
    console.log('registration failed');
  }

});//ready

ipcMain.on('console', function(event, status) {
  console.log(status);
});

ipcMain.on('imprimir', function(event, status) {
 const printer = require("printer");
 const  util = require('util');

    dialog.showMessageBox(mainWindow, {
      type: 'info',
      cancelId:0,
      title: 'Impresora',
      buttons: ['Aceptar'],
      message: 'Impresora predeterminada.',
      //detail :require(native_lib_path).getPrinters()[0].name
      detail: printer.getDefaultPrinterName() || 'No hay impresora predeterminada.',
    });
    
console.log("installed printers:\n"+util.inspect(printer.getPrinters(), {colors:true, depth:10}));

});