const dirBase         =  `file://${__dirname}/html/`,
      fs              =  require('fs'),
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
      globalShortcut  =  electron.globalShortcut
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
  //mainWindow.on('page-title-updated',  () => { console.log('title'); });
  mainWindow.on('closed',  () => {
    mainWindow = null;
    if (process.platform != 'darwin') {
      app.quit();
    }
  });

  // Open the devtools.
  //mainWindow.openDevTools();
  //mainWindow.setProgressBar(0.7);
function globalShortcutSendComand (cmd){
  CNC.sendCommand( cmd , (dataReceived) => {
    console.log(dataReceived);
  });
}
globalShortcut.register('q', () => {
  globalShortcutSendComand('0,0,-20');
  console.log('q is pressed -Z');
});
globalShortcut.register('a', () => { 
  globalShortcutSendComand('20,0,0');
  console.log('a is pressed +X');
});
globalShortcut.register('w', () => { 
  globalShortcutSendComand('0,20,0');
  console.log('w is pressed +Y');
});
globalShortcut.register('s', () => {
  globalShortcutSendComand('0,-20,0');
  console.log('s is pressed -Y');
});
globalShortcut.register('e', () => {
  globalShortcutSendComand('0,0,20');
  console.log('e is pressed +Z');
});
globalShortcut.register('d', () => {
  globalShortcutSendComand('-20,0,0');
  console.log('d is pressed -X');
});
globalShortcut.register('Space', () => {
  globalShortcutSendComand('0,0,0');
  console.log('Space is pressed');
});
globalShortcut.register('Up', () => {
  globalShortcutSendComand('0,20,0');
  console.log('^ is pressed +Y');
});
globalShortcut.register('Down', () => {
  globalShortcutSendComand('0,-20,0');
  console.log('Down is pressed -Y');
});
globalShortcut.register('Left', () => {
  globalShortcutSendComand('20,0,0');
  console.log('< is pressed +X');
});
globalShortcut.register('Right', () => {
  globalShortcutSendComand('-20,0,0');
  console.log('> is pressed -X');
});

});//ready

ipcMain.on('arduino', (event, arg) => {
  CNC.Arduino.reSet().then(function (obj) {
    event.sender.send('arduino-res',obj);
  }) 
});

ipcMain.on('open-file',(event,arg) => {
  CNC.setFile(
    dialog.showOpenDialog({
      title : fileConfig.name,
      filters: [{ name: 'G-Code', extensions: ['txt', 'gcode'] },{ name: 'All Files', extensions: ['*'] }],
      properties: [ 'openFile' ] 
    }), (File) => {
      event.sender.send('open-file-res', File);
    }
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
  CNC.start(arg, (data) => {
    if( data.lineRunning !== false ){
      // mainWindow.setProgressBar(0.7);
      event.sender.send('add-line', { nro : data.lineRunning , line : CNC.File.gcode[data.lineRunning] });
      console.log("I: %s - Ejes: %s - Result: %s", data.lineRunning, CNC.File.gcode[data.lineRunning].ejes , data.steps );  
    }else{
      powerSaveBlocker.stop(id);
      event.sender.send('close-conex',{type: 'none', steps : data.steps});
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

ipcMain.on('show-prefs', (event, arg) => {
  fs.readFile( CNC.dirConfig , "utf8", function (error, data) {
    event.sender.send('show-prefs-res',JSON.parse(data));
  });
});
ipcMain.on('config-send', (event, arg) => {
  CNC.saveConfig( arg , ( data ) => {
      event.sender.send('config-res',data );
  });
});

/*
Event: ‘suspend’
Event: ‘resume’
Event: ‘on-ac’
Event: ‘on-battery’
*/