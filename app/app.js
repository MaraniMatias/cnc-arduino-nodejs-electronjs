const dirBase         =  `file://${__dirname}/html/`,
      fileConfig      =  require('./../gulp-builder-config.json'),
      cnc             =  require('./lib/index.js'),
      menuFile        =  require('./lib/menu.js'),
      electron        =  require('electron'),
      app             =  electron.app,
      BrowserWindow   =  electron.BrowserWindow,
      ipcMain         =  electron.ipcMain,
      dialog          =  electron.dialog,
      Menu            =  electron.Menu,
      globalShortcut  =  electron.globalShortcut // para ctrl+
;
app.on('window-all-closed',  () => {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// deveria listar arduinos conectados      
menuFile.addArduino([{manufacturer:'manufacturer1',comName:'comName1'},{manufacturer:'manufacturer2',comName:'comName2'}]);

var mainWindow = null;
var menu = Menu.buildFromTemplate(menuFile.menuMain);
Menu.setApplicationMenu(menu);

app.on('ready',  () => {
  mainWindow = new BrowserWindow({ 
    center: true,
    minWidth: 1000, 
    minHeight: 600 , 
    title:fileConfig.app.name
  })

  mainWindow.loadURL(dirBase+'index.html');

  ipcMain.on('setArduino', (event, arg) => {
    cnc.arduino.reSet();
    if( cnc.arduino.port == {} ){
      var chosen = dialog.showMessageBox(mainWindow, {
        type     : 'warning',
        title    :  fileConfig.app.name,
        cancelId :  1,
        buttons  :   ['Buscar','Aceptar'],
        message  :  'No encontramos arduino.',
        detail   :  'Para trabajar necesitamos arduino conetado con el programa corespondiente.'
      });
      if (chosen == 0) {
        ipcMain.emit('setArduino');
      }
    }
  });
  

  // Open the devtools.
  mainWindow.openDevTools();
  mainWindow.maximize();
  mainWindow.setProgressBar(0.5);

  ipcMain.on('file',(event,arg) => {
    dialog.showOpenDialog({
      title : fileConfig.app.name,
      filters: [{ name: 'G-Code', extensions: ['txt', 'gcode'] },{ name: 'All Files', extensions: ['*'] }],
      properties: [ 'openFile' ] }
      , (filename) => {
        //cnc.setFile(filename)
        event.sender.send('sendFile', cnc.setFile(filename).name );
      });
  });



// #############################################3
  ipcMain.on('message', (event, arg) => {
    var chosen = dialog.showMessageBox(mainWindow, {
      type: arg.type,
      title: arg.title,
      cancelId:0,
      buttons: ['Aceptar','Cancel'],
      message: arg.header,
      detail: arg.msg
    });
    if (chosen == 0){ 
      mainWindow.destroy();
    }
  });
      
  mainWindow.on('closed',  () => {
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
  
  ipcMain.on('show-prefs', (event, arg) => {
    prefsWindow.show();
  });
  ipcMain.on('hide-prefs', (event, arg) => {
    prefsWindow.hide();
  });

    
  var ret = globalShortcut.register('ctrl+f', () => {
    console.log('ctrl+f is pressed');
  });
  if (!ret) {
    console.log('registration failed');
  }

});//ready

ipcMain.on('console', (event, arg) => {
  console.log(arg);
});
