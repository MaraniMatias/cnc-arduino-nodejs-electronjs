const dirBase = {
  html: `file://${__dirname}/html/`,
  icon: './recursos/cnc-ino.png'
},
  fileConfig = require('./package.json'),
  CNC = require('./lib/main.js'),
  electron = require('electron'),
  app = electron.app,
  BrowserWindow = electron.BrowserWindow,
  ipcMain = electron.ipcMain,
  dialog = electron.dialog,
  Menu = electron.Menu,
  Tray = electron.Tray,
  powerSaveBlocker = electron.powerSaveBlocker,
  globalShortcut = electron.globalShortcut
  ;
app.setName('CNC-ino');

// to not display the default menu to start
Menu.setApplicationMenu(Menu.buildFromTemplate([]));

app.on('window-all-closed', () => {
  CNC.end();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

var mainWindow = null;

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) { mainWindow.restore(); }
    mainWindow.focus()
  }
})
if (shouldQuit) {
  app.quit()
}

app.on('ready', () => {
  try {
    CNC.configFile.set(app.getPath('userData'));
    //var appIcon = new Tray(dirBase.icon);
    //appIcon.setToolTip('This is my application.');
    //appIcon.setContextMenu(contextMenu);

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
    mainWindow.on('closed', () => {
      globalShortcut.unregisterAll();
      mainWindow = null;
      if (process.platform != 'darwin') {
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

ipcMain.on('arduino', (event, arg) => {
  try {
    CNC.Arduino.reSet((obj) => {
      if (CNC.debug.ipc.arduino) { console.log("send", 'arduino-res', obj); }
      event.sender.send('arduino-res', obj);
    });
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
});

ipcMain.on('open-file', (event, data) => {
  try {
    if (!CNC.Arduino.working) {
      console.log("open-file", data);
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
            console.log('File gcode loaded. and crate viwe por gcode...');
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

ipcMain.on('send-command', (event, arg) => {
  try {
    CNC.sendCommand(arg, (data) => {
      if (!CNC.debug.arduino.sendCommand) { console.log("sendCommand: ", dataReceived); }
      event.sender.send('close-conex', data);
    });
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
});

ipcMain.on('send-start', (event, arg) => {
  try {
    if (!CNC.Arduino.working) {
      if (CNC.debug.ipc.sendStart) console.log('send-start', arg);
      //prevent-display-sleep
      //prevent-app-suspension
      var id = powerSaveBlocker.start('prevent-app-suspension');
      if (CNC.debug.app.prevent) console.log('prevent-app-suspension', powerSaveBlocker.isStarted(id));
      CNC.start(arg, (data) => {
        if (data.lineRunning !== false) {
          event.sender.send('add-line', { nro: data.lineRunning, line: CNC.File.gcode[data.lineRunning] });
          if (CNC.debug.ipc.console) console.log("I: %s - Ejes: %s - Result: %s", data.lineRunning, CNC.File.gcode[data.lineRunning].ejes, data.steps);
        } else {
          powerSaveBlocker.stop(id);
          mainWindow.setProgressBar(0);
          event.sender.send('close-conex', { type: 'none', steps: data.steps });
          if (CNC.debug.ipc.console) console.log("Finish.");
        }
      });
    } else { console.log('Working in other project.') }
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
});

ipcMain.on('taksBar-progress', (event, arg) => { mainWindow.setProgressBar(arg); });
ipcMain.on('show-lineTable', (event, arg) => { event.sender.send('show-lineTable') });

ipcMain.on('about', (event, arg) => {
  event.sender.send('config-save-res', { type: 'none', message: 'CNC-ino.' });
  console.log("App path:", app.getAppPath(), '\nRAM:', process.getProcessMemoryInfo());
  let chosen = dialog.showMessageBox(mainWindow, {
    cancelId: 0, type: 'info', buttons: ['Aceptar'],
    title: 'Acerca De', message: 'CNC-ino, Arduino y NodeJS', detail: stringAbout
  });
  // if (chosen == 0)  mainWindow.destroy();
});

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
    CNC.configFile.save(null, (data) => {
      event.sender.send('config-save-res', data);
    });
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      cancelId: 0, type: 'error', buttons: ['Aceptar'],
      title: app.getName(), message: 'Algo salio mal :(', detail: `Error:\n${error.message}`
    });
  }
});

ipcMain.on('contextmenu-enabled', (event, arg) => {
  event.sender.send('contextmenu-enabled-res', arg);
});

/*
Event: ‘suspend’
Event: ‘resume’
Event: ‘on-ac’
Event: ‘on-battery’
*/
ipcMain.on('globalShortcut', (event, endable) => {
  if (endable) registerGlobalShortcut();
  else globalShortcut.unregisterAll();
});
function registerGlobalShortcut() {
  try {
    if (!CNC.Arduino.working) {
      CNC.configFile.read().then((file) => {
        let manalSteps = file.manalSteps;
        function globalShortcutSendComand(cmd) {
          CNC.sendCommand(cmd, (dataReceived) => {
            if (CNC.debug.arduino.sendCommand) { console.log(dataReceived); }
            mainWindow.webContents.send('close-conex', dataReceived);
          });
        }
        globalShortcut.register('q', () => {
          globalShortcutSendComand(`0,0,${manalSteps}`);
          console.log(`Q key pressed and sent 0,0,${manalSteps} command.`);
        });
        globalShortcut.register('e', () => {
          globalShortcutSendComand(`0,0,-${manalSteps}`);
          console.log(`E key pressed and sent 0,0,-${manalSteps} command.`);
        });
        globalShortcut.register('d', () => {
          globalShortcutSendComand(`-${manalSteps},0,0`);
          console.log(`D key pressed and sent -${manalSteps},0,0 command.`);
        });
        globalShortcut.register('a', () => {
          globalShortcutSendComand(`${manalSteps},0,0`);
          console.log(`A key pressed and sent ${manalSteps},0,0 command.`);
        });
        globalShortcut.register('w', () => {
          globalShortcutSendComand(`0,-${manalSteps},0`);
          console.log(`W key pressed and sent 0,-${manalSteps},0 command.`);
        });
        globalShortcut.register('s', () => {
          globalShortcutSendComand(`0,${manalSteps},0`);
          console.log(`S key pressed and sent 0,${manalSteps},0 command.`);
        });
        globalShortcut.register('Space', () => {
          globalShortcutSendComand('0,0,0');
          console.log("SPACE key pressed and sent '0,0,0' command.");
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

var stringAbout = `Proyecto de Router CNC casero con ideas, mano de obra y programacion propia dentro de lo posible.
    \t${app.getName()} v${app.getVersion()}.
    \tElectronJS: ${process.versions.electron}.
    \tRenderer: ${process.versions.chrome}.
    \tRAM: ${process.getProcessMemoryInfo().sharedBytes / 100}Mb.
    Marani Cesar Juan.
    Marani Matias Ezequiel.`
  ;