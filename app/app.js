const dirBase = {
  html: `file://${__dirname}/html/`,
  icon: __dirname + "/recursos/app-icon/png/512.png"// "mac-win/app"
},
  fileConfig = require('./package.json'),
  CNC = require('./lib/main.js'),
  electron = require('electron'),
  app = electron.app,
  BrowserWindow = electron.BrowserWindow,
  nativeImage = electron.nativeImage,
  ipcMain = electron.ipcMain,
  dialog = electron.dialog,
  Menu = electron.Menu,
  Tray = electron.Tray,
  powerSaveBlocker = electron.powerSaveBlocker,
  globalShortcut = electron.globalShortcut
  ;
app.setName('CNC-ino');

// Do not display the default menu to start.
Menu.setApplicationMenu(Menu.buildFromTemplate([]));

/*
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
*/

var mainWindow = null;

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) { mainWindow.restore(); }
    mainWindow.focus()
  }
})
if (shouldQuit) { app.quit() }

app.on('ready', () => {
  try {
    CNC.configFile.set(app.getPath('userData'));
    /*
      var appIcon = new Tray(nativeImage.createFromPath(dirBase.icon));
      appIcon.setToolTip(app.getName());
      appIcon.setContextMenu(Menu.buildFromTemplate([{label: 'Item1', type: 'radio'},{label: 'Item3', type: 'radio', checked: true}]));
    */
    mainWindow = new BrowserWindow({
      experimentalCanvasFeatures: true, // Default false
      disableAutoHideCursor: false, // Default false
      autoHideMenuBar: false, // Default false
      backgroundColor: '#F5F5F5', // Default #FFF 
      useContentSize: true,
      skipTaskbar: false, // Default false
      alwaysOnTop: false, // Default false
      fullscreen: false, // Default false
      frame: true, // Default true
      type: 'normal', // Default normal . On Linux, desktop, dock, toolbar, splash, notification.  On OS X, desktop, textured
      //webPreferences 
      icon: dirBase.icon,
      center: true,
      minWidth: 560,
      minHeight: 450,
      //maxWidth   :  960, 
      //maxHeight  :  600,
      width: 800,
      height: 600,
      title: fileConfig.name
    });
    mainWindow.loadURL(dirBase.html + 'index.html');

    //mainWindow.on('page-title-updated',  () => { console.log('title'); });
    /**
     * Event that fires when the execution ends but can be stopped with the 'onbeforeunload' event in index.js.
     */
    mainWindow.on('closed', () => {
      globalShortcut.unregisterAll();
      mainWindow = null;
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    //mainWindow.openDevTools(); // Open the devtools.
    // Event -> unresponsive, responsive, show, hide
    mainWindow.on('blur', () => { globalShortcut.unregisterAll(); });
    mainWindow.on('focus', () => { if (CNC.Arduino.comName !== "") { registerGlobalShortcut(); } });
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
});//ready

/*
 * Is issued to search arduino
 */
ipcMain.on('arduino', (event, arg) => {
  try {
    CNC.reSetArduino((obj) => {
      CNC.log("send", 'arduino-res', obj);
      event.sender.send('arduino-res', obj);
    });
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
});

/*
 * Is issued to choose a file.
 */
ipcMain.on('open-file', (event, data) => {
  try {
    if (!CNC.Arduino.working) {
      CNC.log("open-file", data);
      globalShortcut.unregisterAll();
      event.sender.send('open-file-tick', { info: 'Abriendo archivo...' });
      CNC.setFile(
        data.fileDir || dialog.showOpenDialog({
          title: fileConfig.name,
          filters: [
            { name: 'File CNC', extensions: ['gcode', 'gif', 'jpg', 'jpeg', 'png', 'nc'] },
            { name: 'G-Code', extensions: ['gcode'] },
            { name: 'Imagen', extensions: ['gif', 'jpg', 'jpeg', 'png'] },
            { name: 'All Files', extensions: ['*'] }
          ],
          properties: ['openFile']
        }),
        data.initialLine = data.initialLine || [0, 0, 0],
        { // CallBack
          /*fileImg: (config) => {
            console.log('Config for img2gcode.');
            event.sender.send('show-prefs-img2gcode-res', config);
          },*/
          tick: (data) => {
            event.sender.send('open-file-tick', data);
          },
          error: (data) => {
            event.sender.send('close-conex', data);
          },
          finished: (File) => {
            CNC.log("open-file", 'File gcode loaded. and crate viwe por gcode...');
            event.sender.send('open-file-res', File);
          }
        }
      ) // CNC.setFile
    } else {
      event.sender.send('config-save-res', { type: 'error', message: 'Esta tabajando.' });
    }
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
});

/**
 * Is issued to send command
 */
ipcMain.on('send-command', (event, arg) => {
  try {
    CNC.sendCommand(arg, (data) => {
      CNC.log("sendCommand:", data);
      event.sender.send('close-conex', data);
    });
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
});

/**
 * Is issued to send start to arduino
 */
ipcMain.on('send-start', (event, arg) => {
  try {
    if (!CNC.Arduino.working) {
      CNC.log("send-start", arg);
      //prevent-display-sleep
      //prevent-app-suspension
      var id = powerSaveBlocker.start('prevent-app-suspension');
      CNC.log('prevent-app-suspension', powerSaveBlocker.isStarted(id));
      CNC.start(arg, (data) => {
        if (data.lineRunning !== false) {
          event.sender.send('add-line', { nro: data.lineRunning, line: CNC.File.gcode[data.lineRunning] });
          CNC.log('send-start', "I: " + data.lineRunning + " - Ejes: " + CNC.File.gcode[data.lineRunning].ejes + " - Result: " + data.steps);
        } else {
          powerSaveBlocker.stop(id);
          mainWindow.setProgressBar(0);
          event.sender.send('close-conex', { type: 'none', steps: data.steps });
          CNC.log('send-start', "Finish.");
        }
      });
    } else { CNC.log('send-start', 'Working in other project.') }
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
});

ipcMain.on('taksBar-progress', (event, arg) => { mainWindow.setProgressBar(arg); });
ipcMain.on('show-lineTable', (event, arg) => { event.sender.send('show-lineTable') });

ipcMain.on('show-prefs', (event, argType) => {
  try {
    if (!CNC.Arduino.working) {
      event.sender.send('config-save-res', { type: 'none', message: 'CNC-ino.' });
      globalShortcut.unregisterAll();
      CNC.configFile.read().then((data) => {
        event.sender.send(`show-prefs-${argType}-res`, data);
      });
    } else {
      event.sender.send('config-save-res', { type: 'error', message: 'Esta tabajando.' });
    }
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
});
ipcMain.on('config-save-send', (event, arg) => {
  try {
    globalShortcut.unregisterAll();
    CNC.configFile.save(arg, (data) => {
      event.sender.send('config-save-res', data);
    });
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
});

ipcMain.on('original-values-prefs', (event, arg) => {
  try {
    dialog.showMessageBox(mainWindow, {
      cancelId: 1, type: 'question', buttons: ['Aceptar', 'Canselar'],
      title: app.getName(), message: 'Volver a los valores originales.',
      detail: 'Se perderan las configuraciones personalizadas generales y image to gcode.'
    }, (opt) => {
      if (opt === 0) {
        CNC.configFile.save(null, (data) => {
          event.sender.send('config-save-res', data);
        });
      }
    });
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
});

/**
 * Disable menus.
 */
ipcMain.on('contextmenu-enabled', (event, arg) => {
  event.sender.send('contextmenu-enabled-res', arg);
});

/**
 * Is used to stop the execution of arduino when the program closes.
 */
ipcMain.on('close', (event, arg) => {
  CNC.log('close', "Send '0,0,0' to Arduino to stop the job.");
  CNC.sendCommand('0,0,0', (data) => {
    event.returnValue = true;
  });
});

/*
Event: ‘suspend’
Event: ‘resume’
Event: ‘on-ac’
Event: ‘on-battery’
*/
/**
 * Settings for globalShortcut
 */
ipcMain.on('globalShortcut', (event, endable) => {
  if (endable) { registerGlobalShortcut(); }
  else { globalShortcut.unregisterAll(); }
  globalShortcut.register('Space', () => {
    globalShortcutSendComand('0,0,0');
    if (CNC.Arduino.info.comName) CNC.log('globalShortcut', "SPACE key pressed and sent '0,0,0 f:0' command.");
  });
});

function globalShortcutSendComand(cmd) {
  try {
    if (CNC.Arduino.info.comName) {
      CNC.sendCommand(cmd, (dataReceived) => {
        CNC.log('globalShortcut', dataReceived);
        mainWindow.webContents.send('close-conex', dataReceived);
      });
    }
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
}

function registerGlobalShortcut() {
  try {
    if (!CNC.Arduino.working) {
      CNC.configFile.read().then((file) => {
        let manalSteps = file.manalSteps;
        globalShortcut.register('q', () => {
          globalShortcutSendComand(`0,0,${manalSteps},0`);
          CNC.log('globalShortcut', `Q key pressed and sent 0,0,${manalSteps} f:0 command.`);
        });
        globalShortcut.register('e', () => {
          globalShortcutSendComand(`0,0,-${manalSteps},0`);
          CNC.log('globalShortcut', `E key pressed and sent 0,0,-${manalSteps} f:0 command.`);
        });
        globalShortcut.register('d', () => {
          globalShortcutSendComand(`-${manalSteps},0,0,0`);
          CNC.log('globalShortcut', `D key pressed and sent -${manalSteps},0,0 f:0 command.`);
        });
        globalShortcut.register('a', () => {
          globalShortcutSendComand(`${manalSteps},0,0,0`);
          CNC.log('globalShortcut', `A key pressed and sent ${manalSteps},0,0 f:0 command.`);
        });
        globalShortcut.register('w', () => {
          globalShortcutSendComand(`0,-${manalSteps},0,0`);
          CNC.log('globalShortcut', `W key pressed and sent 0,-${manalSteps},0 f:0 command.`);
        });
        globalShortcut.register('s', () => {
          globalShortcutSendComand(`0,${manalSteps},0,0`);
          CNC.log('globalShortcut', `S key pressed and sent 0,${manalSteps},0 f:0 command.`);
        });
        //globalShortcut.register('Up', () => { globalShortcutSendComand('0,10,0'); });
        //globalShortcut.register('Down', () => { globalShortcutSendComand('0,-10,0'); });
        //globalShortcut.register('Left', () => { globalShortcutSendComand('10,0,0'); });
        //globalShortcut.register('Right', () => { globalShortcutSendComand('-10,0,0'); });
      });
    }
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
}

ipcMain.on('about', (event, arg) => {
  event.sender.send('config-save-res', { type: 'none', message: 'CNC-ino.' });
  let chosen = dialog.showMessageBox(mainWindow, {
    cancelId: 0, type: 'info', buttons: ['Aceptar'],
    title: 'Acerca De', message: app.getName() + ' , Arduino y NodeJS - v' + app.getVersion(), detail: stringAbout(CNC.Arduino)
  });
  // if (chosen == 0)  mainWindow.destroy();
});
var stringAbout = function (arduino) {
  return `Proyecto de Router CNC casero con ideas, mano de obra y programacion propia.
Use modulos como SerialPort y Framework AngularJS, VisJS, Semantic-UI.
Información de la aplicación:
\tElectronJS: v${process.versions.electron} - Chrome: v${process.versions.chrome}.
\tRAM: Total: ${process.getProcessMemoryInfo().sharedBytes / 100}Mb. Solo app: ${process.getProcessMemoryInfo().privateBytes / 100}Mb.
Información de Arduino (${CNC.Arduino.info.manufacturer}):
\tPuerto: ${CNC.Arduino.info.comName}
\tCodigo: ${CNC.Arduino.info.version}
Autores:  Marani Cesar Juan, Marani Matias Ezequiel.`
    ;
}