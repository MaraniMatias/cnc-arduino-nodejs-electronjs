const dirBase         =  `file://${__dirname}/html/`,
      fileConfig      =  require('./package.json'),
      CNC             =  require('./lib/main.js'),
      menuFile        =  require('./lib/menu.js'),
      electron        =  require('electron'),
      app             =  electron.app,
      BrowserWindow   =  electron.BrowserWindow,
      ipcMain         =  electron.ipcMain,
      dialog          =  electron.dialog,
      Menu            =  electron.Menu,
      Tray            =  electron.Tray,
      globalShortcut  =  electron.globalShortcut // para ctrl+
;

app.on('window-all-closed',  () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// deveria listar Arduinos conectados      
menuFile.addArduino([{manufacturer:'manufacturer1',comName:'comName1'},{manufacturer:'manufacturer2',comName:'comName2'}]);

var mainWindow = null;
var menu = Menu.buildFromTemplate(menuFile.menuMain);
Menu.setApplicationMenu(menu);

app.on('ready',  () => {
  mainWindow = new BrowserWindow({
    disableAutoHideCursor  :  false, // Default false
    autoHideMenuBar  :  false, // Default false
    useContentSize   :  true,
    skipTaskbar      :  false, // Default false
    alwaysOnTop      :  false, // Default false
    fullscreen       :  false, // Default false
    frame            :  true, // Default true
    type             :  'normal' , // Default normal . On Linux, desktop, dock, toolbar, splash, notification.  On OS X, desktop, textured
    //webPreferences 
    icon       : './recursos/icon.png',
    center     :  true,
    minWidth   :  1000, 
    minHeight  :  600,
    title      :  fileConfig.name
  });
  mainWindow.loadURL(dirBase+'index.html');

  mainWindow.on('closed',  () => {
    mainWindow = null;
    if (process.platform != 'darwin') {
      app.quit();
    }
  });

  // Open the devtools.
  //mainWindow.openDevTools();
  //mainWindow.maximize();
  mainWindow.setProgressBar(0.7);


// ##### old : START
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
    console.log('registration failed: globalShortcut.register -> ctrl+f');
  }
  
// ##### old : END
});//ready


ipcMain.on('arduino', (event, arg) => {
  CNC.Arduino.reSet().then(function (ardu) {
    event.sender.send('arduino-res',{ type:ardu===''? 'error':'' , code:ardu===''? 'No encontramos ardiono.':'Arduino detectado: '+ardu});
  })
});

ipcMain.on('open-file',(event,arg) => {
  event.returnValue = CNC.setFile(
    dialog.showOpenDialog({
      title : fileConfig.name,
      filters: [{ name: 'G-Code', extensions: ['txt', 'gcode'] },{ name: 'All Files', extensions: ['*'] }],
      properties: [ 'openFile' ] 
      //,}(filename) => { if (filename) { event.returnValue = CNC.setFile(filename); } }
    })
  )
});

ipcMain.on('send-command', (event, arg) => {
  CNC.sendCommand( arg.code, arg.type , (data) =>{
    var dataReceived = data.split(',');
    if(dataReceived[0]==='0' && dataReceived[1]==='0' && dataReceived[2]==='0'){
      console.log('-> File: ',__filename,'\n->',dataReceived,'-> Emit -->> Terminado <<--');
      //req.io.broadcast('closeConex', line._clone('Terminado') );
      event.sender.send('asynchronous-reply',{code:'Terminado'});
    }else{//Pause
      console.log('-> File: ',dataReceived,'Emit -->> Pausado <<--');
      //req.io.broadcast('closeConex', line._clone('Pausado') );
      //event.sender.send('closeConex',{steps:dataReceived,code:'Terminado'});
    }
  });
});


// # Test doc. :START
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log('-> 1',arg); 
  event.sender.send('asynchronous-reply', 'pong 1');
});
ipcMain.on('synchronous-message', (event, arg) => {
  console.log('-> 2',arg);
  event.returnValue = 'pong 2';
});
// # Test doc. :END


/*
Event: ‘suspend’
Event: ‘resume’
Event: ‘on-ac’
Event: ‘on-battery’
*/