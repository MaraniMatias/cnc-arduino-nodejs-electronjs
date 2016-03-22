const dirBase         =  `file://${__dirname}/html/`,
      fileConfig      =  require('./package.json'),
      CNC             =  require('./lib/main.js'),
      electron        =  require('electron'),
      app             =  electron.app,
      BrowserWindow   =  electron.BrowserWindow,
      ipcMain         =  electron.ipcMain,
      dialog          =  electron.dialog,
      Menu            =  electron.Menu,
      Tray            =  electron.Tray,
      powerSaveBlocker = electron.powerSaveBlocker,
      globalShortcut  =  electron.globalShortcut // para ctrl+
;

app.on('window-all-closed',  () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

var mainWindow  = null;
var prefsWindow = null;

// to not display the default menu to start
var menu = Menu.buildFromTemplate( [] );
Menu.setApplicationMenu(menu);

app.on('ready',  () => {
  //var appIcon = new Tray('./recursos/icon.png');
  //appIcon.setToolTip('This is my application.');
  //appIcon.setContextMenu(contextMenu);

  mainWindow = new BrowserWindow({
    experimentalCanvasFeatures  :  true, // Default false
    disableAutoHideCursor  :  false, // Default false
    autoHideMenuBar  :  false, // Default false
    backgroundColor  :  '#F5F5F5', // Default #FFF 
    useContentSize   :  true,
    skipTaskbar      :  false, // Default false
    alwaysOnTop      :  false, // Default false
    fullscreen       :  false, // Default false
    frame            :  true, // Default true
    type             :  'normal' , // Default normal . On Linux, desktop, dock, toolbar, splash, notification.  On OS X, desktop, textured
    //webPreferences 
    //icon       :  appIcon,
    center     :  true,
    minWidth   :  960, 
    minHeight  :  600,
    maxWidth   :  960, 
    maxHeight  :  600,
    title      :  fileConfig.name
  });
  mainWindow.loadURL(dirBase+'index.html');
  mainWindow.on('page-title-updated',  () => {
    console.log('title');
  });
  mainWindow.on('closed',  () => {
    mainWindow = null;
    if (process.platform != 'darwin') {
      app.quit();
    }
  });

  // Open the devtools.
  //mainWindow.openDevTools();
  mainWindow.setProgressBar(0.7);

  var ret = globalShortcut.register('ctrl+f', () => {
    console.log('ctrl+f is pressed');
  });
  if (!ret)  console.log('registration failed: globalShortcut.register -> ctrl+f');
  
  /*ipcMain.on('show-prefs', (event, arg) => {
    if(!prefsWindow){
      prefsWindow = new BrowserWindow({
        width     :  400, 
        height    :  400,
        resizable :  false,
        //show    :  false,
        alwaysOnTop  :  true, // Default false
        skipTaskbar  :  true,
        title   :  'Preferencias.'
      }).loadURL(dirBase+'preferences.html');
    }else{
      ipcMain.emit('hide-prefs');
    }
  });
  ipcMain.on('hide-prefs', (event, arg) => {
    prefsWindow.hide();
    prefsWindow = null;
  });*/
  ipcMain.on('show-prefs', (event, arg) => {
    event.sender.send('show-prefs-res',{
      //enviar config
    });
  });
  

});//ready

ipcMain.on('arduino', (event, arg) => {
  CNC.Arduino.reSet().then(function (ardu) {
    event.sender.send('arduino-res',{ type:ardu===''? 'danger':'success' , code:ardu===''? 'No encontramos ardiono.':'Arduino detectado: '+ardu});
  })
});

ipcMain.on('open-file',(event,arg) => {
  event.returnValue = CNC.setFile(
    dialog.showOpenDialog({
      title : fileConfig.name,
      filters: [{ name: 'G-Code', extensions: ['txt', 'gcode'] },{ name: 'All Files', extensions: ['*'] }],
      properties: [ 'openFile' ] 
    })
  )
});

ipcMain.on('send-command', (event, arg) => {
  CNC.sendCommand( arg , (dataReceived) => {
    event.sender.send('close-conex',dataReceived);
  });
});

ipcMain.on('send-start', (event, arg) => {
  //prevent-display-sleep
  //prevent-app-suspension
  var id = powerSaveBlocker.start('prevent-app-suspension');
  console.log('prevent-app-suspension',powerSaveBlocker.isStarted(id));
  
  CNC.start(arg.line, (data) => {
    if( data.nro !== false ){
      // mainWindow.setProgressBar(0.7);
      event.sender.send('add-line', { nro : data.nro , line : CNC.File.gcode[data.nro] });
      console.log("I: %s - Ejes: %s - Result: %s", data.nro, CNC.File.gcode[data.nro].ejes , data.result );  
    }else{
      powerSaveBlocker.stop(id);
      event.sender.send('close-conex',{type: 'none', data : data.result});
      console.log("Finish.");
    }
  });
});




ipcMain.on('about', (event, arg) => {
  var chosen = dialog.showMessageBox( mainWindow, {
    cancelId  :  0,
    type     :  'info',
    title    :  'Acerca De',
    buttons  :  ['Aceptar'],
    message  :  'CNC-ino, Arduino y NodeJS',
    detail   :  'Proyecto de Router CNC casero con ideas, mano de obra y programacion propia dentro de lo posible.\n\tMarani Cesar Juan.\n\tMarani Matias Ezequiel.'
  });
  // if (chosen == 0)  mainWindow.destroy();
});

/*
Event: ‘suspend’
Event: ‘resume’
Event: ‘on-ac’
Event: ‘on-battery’
*/