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
app.setName(fileConfig.productName);

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
      defaultFontSize: 16,
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
    // Event -> unresponsive, responsive, show, hide, minimize, restore
    mainWindow.on('blur', () => { globalShortcut.unregisterAll(); });
    mainWindow.on('hide', () => { globalShortcut.unregisterAll(); });
    mainWindow.on('minimize', () => { globalShortcut.unregisterAll(); });

    mainWindow.on('focus', () => { registerGlobalShortcut(); });
    mainWindow.on('show', () => { registerGlobalShortcut(); });
    mainWindow.on('restore', () => { registerGlobalShortcut(); });

  } catch (error) {
    tryCatch(error);
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
    tryCatch(error);
  }
});

/*
 * Is issued to choose a file.
 */
ipcMain.on('open-file', (event, data) => {
  try {
    if (!CNC.Arduino.isWorking) {
      CNC.log("open-file", data);
      globalShortcut.unregisterAll();
      event.sender.send('open-file-tick', { info: 'Abriendo archivo...' });
      CNC.setFile(
        data.fileDir || dialog.showOpenDialog({
          title: app.getName(),
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
    tryCatch(error);
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
    tryCatch(error);
  }
});

/**
 * Is issued to send start to arduino
 */
ipcMain.on('send-start', (event, arg) => {
  try {
    if (!CNC.Arduino.isWorking) {
      CNC.log("send-start", arg);
      //prevent-display-sleep
      //prevent-app-suspension
      var id = powerSaveBlocker.start('prevent-app-suspension');
      CNC.log('prevent-app-suspension', powerSaveBlocker.isStarted(id));
      CNC.start(arg, (data) => {
        if (data.lineRunning !== false) {
          let line = CNC.File.gcode[data.lineRunning];
          line.steps = data.steps;
          event.sender.send('add-line', { nro: data.lineRunning, line });
          CNC.log('send-start', "I: " + data.lineRunning + " - Ejes: " + line.ejes + " - Steps: " + line.steps);
        } else {
          powerSaveBlocker.stop(id);
          mainWindow.setProgressBar(0);
          event.sender.send('close-conex', { type: 'none', steps: data.steps });
          CNC.log('send-start', "Finish.");
        }
      });
    } else { CNC.log('send-start', 'Working in other project.') }
  } catch (error) {
    tryCatch(error);
  }
});

ipcMain.on('taksBar-progress', (event, arg) => { mainWindow.setProgressBar(arg); });
ipcMain.on('show-lineTable', (event, arg) => { event.sender.send('show-lineTable') });

ipcMain.on('show-prefs', (event, argType) => {
  try {
    if (!CNC.Arduino.isWorking) {
      event.sender.send('config-save-res', { type: 'none', message: 'CNC-ino.' });
      globalShortcut.unregisterAll();
      CNC.configFile.read().then((data) => {
        event.sender.send(`show-prefs-${argType}-res`, data);
      });
    } else {
      event.sender.send('config-save-res', { type: 'error', message: 'Esta tabajando.' });
    }
  } catch (error) {
    tryCatch(error);
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
    tryCatch(error);
  }
});

ipcMain.on('save-ArduinoCode-prefs', (event, arg) => {
  try {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'info', buttons: ['Aceptar'],
      title: app.getName(), message: 'Guardar Codigo para Arduino.',
      detail: 'Elija la ubicacion del codigo para después abrir con IDE de Arduino y grabarlo en Arduino.'
    });
    CNC.saveArduinoCode(dialog.showOpenDialog({
      title: app.getName() + ' - Elejir una ubicacion.', properties: ['openDirectory']
    }), (msg) => {
      event.sender.send('config-save-res', msg);
    })
  } catch (error) {
    tryCatch(error);
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
  CNC.sendCommand({ code: '0,0,0' }, (data) => {
    CNC.log('close', "Send '0,0,0' to Arduino to stop the job.");
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
  if (CNC.Arduino.comName) {
    globalShortcut.register('Space', () => {
      globalShortcutSendComand('0,0,0');
      CNC.log('globalShortcut', "SPACE key pressed and sent '0,0,0 f:0' command.");
    });
  }
});

function globalShortcutSendComand(cmd) {
  try {
    if (CNC.Arduino.comName) {
      CNC.sendCommand({ code: cmd }, (dataReceived) => {
        CNC.log('globalShortcut', dataReceived);
        mainWindow.webContents.send('close-conex', dataReceived);
      });
    }
  } catch (error) {
    tryCatch(error);
  }
}

function registerGlobalShortcut() {
  try {
    if (!CNC.Arduino.isWorking && CNC.Arduino.comName) {
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
    tryCatch(error);
  }
}

function tryCatch(error) {
  console.error('tryCatch:\n', error);
  dialog.showMessageBox(mainWindow, {
    cancelId: 0, type: 'error', buttons: ['Aceptar'],
    title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
  });
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
Información de Arduino (${CNC.Arduino.manufacturer}):
\tPuerto: ${CNC.Arduino.comName}
\tCodigo: ${CNC.Arduino.version}
Autores:  Marani Cesar Juan, Marani Matias Ezequiel.`
    ;
}