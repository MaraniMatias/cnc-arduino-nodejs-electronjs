const dirBase         =  `file://${__dirname}/html/`,
      fileConfig      =  require('./../task-builder-config.json'),
      CNC             =  require('./lib/main.js'),
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
    center: true,
    minWidth: 1000, 
    minHeight: 600 , 
    title:fileConfig.app.name
  });
  mainWindow.loadURL(dirBase+'index.html');
  mainWindow.on('closed',  () => {
    mainWindow = null;
    if (process.platform != 'darwin') {
      app.quit();
    }
  });

  // Open the devtools.
  mainWindow.openDevTools();
  mainWindow.maximize();
  mainWindow.setProgressBar(0.7);


// ## old : START
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
    console.log('registration failed');
  }
  
// ##### old : END
});//ready

ipcMain.on('set-arduino', (event, arg) => {
  if( !CNC.Arduino.reSet() ){
    var chosen = dialog.showMessageBox(mainWindow, {
      type     : 'warning',
      title    :  fileConfig.app.name,
      cancelId :  1,
      buttons  :   ['Buscar','Aceptar'],
      message  :  'No encontramos Arduino.',
      detail   :  'Para trabajar necesitamos Arduino conetado con el programa corespondiente.'
    });
    if (chosen == 0) {
      ipcMain.emit('set-arduino');
    }else{
      event.sender.send("addLineTable",  CNC.Line('Sin Arduino.'));
    }
  }else{
    event.sender.send("addLineTable",  CNC.Line("Arduino: "+ CNC.Arduino.manufacturer +" Puerto: "+ CNC.Arduino.comName ));
  }
  
});

ipcMain.on('console', (event, arg) => {
  console.log(arg);
});

ipcMain.on('open-file',(event,arg) => {
  event.returnValue = CNC.setFile(
    dialog.showOpenDialog({
      title : fileConfig.app.name,
      filters: [{ name: 'G-Code', extensions: ['txt', 'gcode'] },{ name: 'All Files', extensions: ['*'] }],
      properties: [ 'openFile' ] 
      //,}(filename) => { if (filename) { event.returnValue = CNC.setFile(filename); } }
    })
  )
});

ipcMain.on('send-command', (event, arg) => {
  
  CNC.setFile(
    dialog.showOpenDialog({
      title : fileConfig.app.name,
      filters: [{ name: 'G-Code', extensions: ['txt', 'gcode'] },{ name: 'All Files', extensions: ['*'] }],
      properties: [ 'openFile' ] 
    })
  )
  
});
    

// # Test doc. :START
ipcMain.on('asynchronous-message', (event, arg) => { console.log(arg); 
  event.sender.send('asynchronous-reply', 'pong');
});

ipcMain.on('synchronous-message', (event, arg) => { console.log(arg);
  event.returnValue = 'pong';
});
// # Test doc. :END